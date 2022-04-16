import {Module, Player} from "../player";
import {SongChangeEvent} from "../events";
import {httpsAdapter} from "../util";

/**
 * Media Session module.
 * Current song's metadata will be handled by browser when using this module.
 */
export default class implements Module {
    private player: Player;

    constructor() {
        this.updatePositionState = this.updatePositionState.bind(this);
    }

    private updatePositionState() {
        if ("setPositionState" in navigator.mediaSession) {
            const audio = this.player.audio;
            navigator.mediaSession.setPositionState({
                duration: audio.duration,
                playbackRate: audio.playbackRate,
                position: audio.currentTime
            });
        }
    }

    initialize(player: Player) {
        this.player = player;

        if (!("mediaSession" in navigator)) {
            throw new Error("Media Session is not supported!");
        }

        navigator.mediaSession.setActionHandler("play", () => this.player.play());
        navigator.mediaSession.setActionHandler("pause", () => this.player.pause());
        navigator.mediaSession.setActionHandler("nexttrack", () => this.player.next());
        navigator.mediaSession.setActionHandler("previoustrack", () => this.player.previous());
        navigator.mediaSession.setActionHandler("seekforward", (details) => {
            const skipTime = details.seekOffset || 10;
            player.currentTime = Math.min(player.currentTime + skipTime, player.duration);
        });
        navigator.mediaSession.setActionHandler("seekbackward", (details) => {
            const skipTime = details.seekOffset || 10;
            player.currentTime = Math.max(player.currentTime - skipTime, 0);
        });
        try {
            navigator.mediaSession.setActionHandler("seekto", (details) => {
                if (details.seekTime)
                    player.currentTime = details.seekTime;
            });
        } catch (e) {
            console.warn("seekto unsupported");
        }

        player.addEventListener("songchange", (e: SongChangeEvent) => {
            const s = e.song;
            const thumbnail = s.thumbnail || ""; // TODO: Thumbnail fallback image
            navigator.mediaSession.metadata = new MediaMetadata({
                title: s.name,
                artist: s.artists.join(", "),
                album: s.album || "",
                artwork: [
                    {
                        src: player.options.enforceHttps ? httpsAdapter(thumbnail) : thumbnail
                    }
                ]
            });
        });
        player.audio.addEventListener("play", () => {
            navigator.mediaSession.playbackState = "playing";
        });
        player.audio.addEventListener("pause", () => {
            navigator.mediaSession.playbackState = "paused";
        });
        player.audio.addEventListener("durationchange", this.updatePositionState);
        player.audio.addEventListener("ratechange", this.updatePositionState);
        player.audio.addEventListener("timeupdate", this.updatePositionState); // Performance impact?
    }
}