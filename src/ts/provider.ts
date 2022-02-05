import { Song } from "./player";
import { Playlist } from "./playlist";

const providers = {};

export interface Provider {
    fetchPlaylist(list: Playlist): Promise<Song[]>
    fetchUrl(song: Song): Promise<string>
    fetchThumbnail(song: Song): Promise<string>
}

export function addProvider(id: string, provider: Provider) {
    if (providers[id] != undefined) throw new Error("Provider is already registered");
    providers[id] = provider;
}

export function findProvider(id: string): Provider {
    return providers[id];
}