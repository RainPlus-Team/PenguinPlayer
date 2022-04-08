import { Player } from "../player";
import { getSongListLength } from "../playlist";
import { addPlaymode, Playmode } from "../playmode";

class ListLoop implements Playmode {
    player: Player;

    initialize(player: Player): void {
        this.player = player;
    }

    handleNext() {
        let c = this.player.currentSongIndex;
        if (c < getSongListLength(this.player.songs) - 1) {
            c++;
        } else {
            c = 0;
        }
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

addPlaymode("listloop", new ListLoop());