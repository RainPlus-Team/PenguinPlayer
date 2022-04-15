import {Module, Player} from "./player";
import {SongChangeEvent} from "./events";

/**
 * Media Session module.
 * Current song's metadata will be handled by browser when using this module.
 * @class
 */
export default class implements Module {
    private player: Player;

    initialize(player: Player) {
        this.player = player;

        navigator.mediaSession.setActionHandler("play", () => this.player.play());
        navigator.mediaSession.setActionHandler("pause", () => this.player.pause());
        navigator.mediaSession.setActionHandler("nexttrack", () => this.player.next());
        navigator.mediaSession.setActionHandler("previoustrack", () => this.player.previous());

        player.addEventListener("songchange", (e: SongChangeEvent) => {
            const s = e.song;
            const thumbnail = s.thumbnail || ""; // TODO: Thumbnail fallback image
            navigator.mediaSession.metadata = new MediaMetadata({
                title: s.name,
                artist: s.artists.join(", "),
                album: s.album || "",
                artwork: [
                    {
                        src: thumbnail
                    }
                ]
            });
        });
        player.audio.addEventListener("playing", () => {
            navigator.mediaSession.playbackState = "playing";
        });
        player.audio.addEventListener("pause", () => {
            navigator.mediaSession.playbackState = "paused";
        });
    }
}