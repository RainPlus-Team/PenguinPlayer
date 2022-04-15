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
        let c = this.player.currentSongIndex;
        if (c < getSongListLength(this.player.songs) - 1) {
            c++;
        } else if (user) {
            c = 0;
        }
        if (c != this.player.currentSongIndex)
            this.player.play(c);
    }

    handlePrevious() {
        let c = this.player.currentSongIndex;
        if (c <= 0) {
            c = getSongListLength(this.player.songs) - 1;
        } else {
            c--;
        }
        this.player.play(c);
    }
}

addPlaymode("list", new List());