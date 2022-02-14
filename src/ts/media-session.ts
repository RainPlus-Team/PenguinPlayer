import { Player, Song } from "./player";

class MediaSessionManager { // TODO: As a player module
    private player: Player

    constructor(player: Player) {
        this.player = player;

        navigator.mediaSession.setActionHandler("play", () => this.player.play());
        navigator.mediaSession.setActionHandler("pause", () => this.player.pause());
        navigator.mediaSession.setActionHandler("nexttrack", () => this.player.next());
        navigator.mediaSession.setActionHandler("previoustrack", () => this.player.previous());

        // TODO: Listen for player events
    }
}