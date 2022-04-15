import {Player} from "../player";
import {getSongListLength} from "../playlist";
import {addPlaymode, Playmode} from "../playmode";

/**
 * Playmode that loops a songlist.
 */
class ListLoop implements Playmode {
    player: Player;

    initialize(player: Player): void {
        this.player = player;
    }

    handleNext() {
        const c = this.player.currentSongIndex;
        const len = getSongListLength(this.player.songs);
        this.player.play((c + 1) % len);
    }

    handlePrevious() {
        const c = this.player.currentSongIndex;
        const len = getSongListLength(this.player.songs);
        this.player.play((c - 1 + len) % len);
    }
}

addPlaymode("listloop", ListLoop);