import { Player } from "../player";
import { getSongListLength } from "../playlist";
import { addPlaymode, Playmode } from "../playmode";

class SingleLoop implements Playmode {
    player: Player

    initialize(player: Player): void {
        this.player = player;
    }

    handleNext(user: boolean): void {
        if (!user)
            this.player.play();
        else {
            const len = getSongListLength(this.player.songs);
            const cId = this.player.currentSong;
            if (cId >= len + 1) {
                this.player.play(0);
            } else {
                this.player.play(cId + 1);
            }
        }
    }

    handlePrevious(user: boolean): void {
        if (!user)
            this.player.play();
        else {
            const len = getSongListLength(this.player.songs);
            const cId = this.player.currentSong;
            if (cId <= 0) {
                this.player.play(len - 1);
            } else {
                this.player.play(cId - 1);
            }
        }
    }
}

addPlaymode("singleloop", new SingleLoop());