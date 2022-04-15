import {Player, Song} from "../player";
import {addPlaymode, Playmode} from "../playmode";
import {shuffle} from "../util";

interface SongWithOriginalInfo {
    song: Song,
    provider: string
    index: number
}

/**
 * Playmode that plays a songlist randomly.
 */
class Random implements Playmode {
    randomizedList: SongWithOriginalInfo[];
    player: Player;

    initialize(player: Player): void {
        this.player = player;
        this.randomizedList = [];
        let previousLength = 0;
        for (let i = 0;i<player.songs.length;i++) {
            const list = player.songs[i];
            for (let j = 0;i<list.songs.length;j++) {
                const song = list.songs[j];
                this.randomizedList.push({
                    song,
                    provider: list.provider,
                    index: previousLength + j
                });
            }
            previousLength += list.songs.length;
        }
        shuffle(this.randomizedList);
    }

    private findRandId(index: number) {
        const cId = index;
        let randId = -1;
        for (const item of this.randomizedList) {
            if (item.index == cId) {
                randId = cId;
                break;
            }
        }
        return randId;
    }

    handleNext() {
        const randId = this.findRandId(this.player.currentSongIndex);
        if (randId < 0) {
            // Must do something?
            this.player.play(this.randomizedList[0].index);
        } else {
            if (randId >= this.randomizedList.length + 1) {
                this.player.play(this.randomizedList[0].index);
            } else {
                this.player.play(this.randomizedList[randId + 1].index);
            }
        }
    }

    handlePrevious() {
        const randId = this.findRandId(this.player.currentSongIndex);
        if (randId < 0) {
            // Must do something?
            this.player.play(this.randomizedList[0].index);
        } else {
            if (randId <= 0) {
                this.player.play(this.randomizedList[this.randomizedList.length - 1].index);
            } else {
                this.player.play(this.randomizedList[randId - 1].index);
            }
        }
    }
}

addPlaymode("random", new Random());