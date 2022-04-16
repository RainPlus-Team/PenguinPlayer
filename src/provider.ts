import { Song } from "./player";
import { Playlist } from "./playlist";

export const providers = {};

/**
 * Interface for classes that represent a music provider.
 */
export interface Provider {
    /**
     * Gets the playlist from the provider.
     * @param list - The instance of the playlist.
     */
    fetchPlaylist(list: Playlist): Promise<Song[]>

    /**
     * Gets the play URL from the provider.
     * @param song - The instance of the song.
     */
    fetchUrl(song: Song): Promise<string>

    /**
     * Gets the URL of the thumbnail from the provider.
     * @param song - The instance of the song.
     */
    fetchThumbnail(song: Song): Promise<string>
}

/**
 * Register a provider.
 * @param id - The ID of the provider.
 * @param provider - The instance of the provider.
 */
export function addProvider(id: string, provider: Provider) {
    if (providers[id] != undefined) throw new Error("Provider is already registered");
    providers[id] = provider;
}

/**
 * Finds a provider.
 * @param id - The ID of the player.
 */
export function findProvider(id: string): Provider {
    return providers[id];
}