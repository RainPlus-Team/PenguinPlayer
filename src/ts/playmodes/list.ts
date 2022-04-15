import {Player} from "../player";
import {getSongListLength} from "../playlist";
import {addPlaymode, Playmode} from "../playmode";

/**
 * Playmode that only play through a songlist once.
 */
class List implements Playmode {
    player: Player;

    initialize(player: Player): void {
        this.player = player;
    }

    handleNext(user: boolean) {
        const c = this.player.currentSongIndex;
        const len = getSongListLength(this.player.songs);
        if (user || c < len - 1)
            this.player.play((c + 1) % len);
    }

    handlePrevious() {
        const c = this.player.currentSongIndex;
        const len = getSongListLength(this.player.songs);
        this.player.play((c - 1 + len) % len);
    }
}

addPlaymode("list", List);