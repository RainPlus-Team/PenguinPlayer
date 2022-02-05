import { Player, Song } from "../player";
import { getSongListLength } from "../playlist";
import { addPlaymode, Playmode } from "../playmode";
import { shuffle } from "../util";

interface SongWithProvider {
    song: Song,
    provider: string
}

class Random implements Playmode {
    randomizedList: SongWithProvider[];
    player: Player

    initialize(player: Player): void {
        this.player = player;
        this.randomizedList = [];
        for (let list of player.songs) {
            for (let song of list.songs) {
                this.randomizedList.push({
                    song,
                    provider: list.provider
                })
            }
        }
        shuffle(this.randomizedList);
    }

    handleNext(_: boolean) {
    }

    handlePrevious(_: boolean) {
    }
}

addPlaymode("listloop", new Random());