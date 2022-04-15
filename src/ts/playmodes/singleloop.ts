import {Player} from "../player";
import {getSongListLength} from "../playlist";
import {addPlaymode, Playmode} from "../playmode";

/**
 * Playmode that loops one song.
 */
class SingleLoop implements Playmode {
    player: Player;

    initialize(player: Player): void {
        this.player = player;
    }

    handleNext(user: boolean): void {
        if (!user)
            this.player.play();
        else {
            const c = this.player.currentSongIndex;
            const len = getSongListLength(this.player.songs);
            this.player.play((c + 1) % len);
        }
    }

    handlePrevious(user: boolean): void {
        if (!user)
            this.player.play();
        else {
            const c = this.player.currentSongIndex;
            const len = getSongListLength(this.player.songs);
            this.player.play((c - 1 + len) % len);
        }
    }
}

addPlaymode("singleloop", SingleLoop);