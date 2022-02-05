import { Player } from "./player";

export interface Playmode {
    initialize(player: Player): void;
    handleNext(user: boolean): void;
    handlePrevious(user: boolean): void;
}

const playmodes = {};

export function addPlaymode(id: string, playmode: Playmode) {
    if (playmodes[id] != undefined) throw new Error("Playmode is already registered");
    playmodes[id] = playmode;
}

export function findPlaymode(id: string): Playmode {
    return playmodes[id];
}