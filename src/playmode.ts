import { Player } from "./player";

/**
 * Interface for classes that represent a playmode.
 */
export interface Playmode {
    /**
     * Initializes a playmode.
     * @param player - The instance of the player.
     */
    initialize(player: Player): void;

    /**
     * Handles the next operation.
     * @param user - Is the operation triggered by user?
     */
    handleNext(user: boolean): void;

    /**
     * Handles the previous operation.
     * @param user - Is the operation triggered by user?
     */
    handlePrevious(user: boolean): void;
}

export const playmodes = {};

/**
 * Register a playmode.
 * @param id - The ID of the playmode.
 * @param playmode - The instance of the playmode.
 */
export function addPlaymode(id: string, playmode: new () => Playmode) {
    if (playmodes[id] != undefined) throw new Error("Playmode is already registered");
    playmodes[id] = playmode;
}

/**
 * Finds a playmode.
 * @param id - The ID of the playmode.
 */
export function findPlaymode(id: string): new () => Playmode {
    return playmodes[id];
}