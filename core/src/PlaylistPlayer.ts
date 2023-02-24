import Player from "./Player";

export interface PlaylistOptions {

}

class PlaylistPlayer extends Player {
    /**
     * Play next music in list.
     */
    next(): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * Play previous music in list.
     */
    previous(): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * Adds a new playlist.
     */
    async addPlaylist(option: PlaylistOptions) {

    }
}

export default PlaylistPlayer;