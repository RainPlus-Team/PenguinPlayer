import Player from "./player";

const playModes: { [key: string]: PlayMode } = {};

/**
 * Represents an interface for play modes.
 */
export interface PlayMode {
    /**
     * Initializes play mode.
     * @param player - Instance of the player.
     */
    initialize(player: Player);

    /**
     * Handles play next request.
     * @param user - Indicates if the operation is triggered by user.
     */
    handleNext(user: boolean);

    /**
     * Handles play previous request.
     * @param user - Indicates if the operation is triggered by user.
     */
    handlePrevious(user: boolean);
}

/**
 * Add a play mode.
 * @param id - ID of the play mode.
 * @param playMode - Instance of the play mode.
 */
export function addPlayMode(id: string, playMode: PlayMode) {
    playModes[id] = playMode;
}

export default playModes;