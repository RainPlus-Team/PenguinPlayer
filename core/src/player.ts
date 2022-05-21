export interface Options {
    autoplay?: boolean
}

export interface Module {
    initialize(player: Player)
}

class Player extends EventTarget {
    constructor() {
        super();

    }

    /**
     * Play next music in list.
     */
    next() {

    }

    /**
     * Play previous music in list.
     */
    previous() {

    }

    /**
     * Loads a new playlist to player.
     */
    async addPlaylist() {

    }

    /**
     * Loads a single song to player.
     */
    async addSong() {

    }

    /**
     * Loads a module to player.
     */
    async addModule() {

    }
}

export default Player;