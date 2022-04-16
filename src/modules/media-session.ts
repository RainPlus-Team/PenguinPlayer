import {Module, Player} from "../player";
import {SongChangeEvent} from "../events";
import {httpsAdapter} from "../util";

/**
 * Media Session module.
 * Current song's metadata will be handled by browser when using this module.
 */
export default class implements Module {
    private player: Player;
    private _lastCurrentTime = -1;

    constructor() {
        this.updatePositionState = this.updatePositionState.bind(this);
    }

    private updatePositionState() {
        if ("setPositionState" in navigator.mediaSession) {
            const audio = this.player.audio;
            if (!isNaN(audio.duration)) {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate,
                    position: audio.currentTime
                });
            } else {
                navigator.mediaSession.setPositionState(null);
            }
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
            this._lastCurrentTime = -1;
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
            this.updatePositionState();
        });
        player.audio.addEventListener("pause", () => {
            navigator.mediaSession.playbackState = "paused";
            this.updatePositionState();
        });
        player.audio.addEventListener("durationchange", this.updatePositionState);
        player.audio.addEventListener("ratechange", this.updatePositionState);

        player.audio.addEventListener("timeupdate", () => {
            const time = this.player.audio.currentTime;
            if (!isNaN(time)) {
                if (this._lastCurrentTime != -1 && Math.abs(time - this._lastCurrentTime) > 5)
                    this.updatePositionState();
                this._lastCurrentTime = time;
            }
        });
    }
}