import { Song } from "./player";

/**
 * Interface for classes that represent a playlist.
 */
export interface Playlist {
    provider: string
    //priority?: number
}

export interface SongList {
    provider: string
    songs: Song[]
}

export function getSongListLength(songlist: SongList[]): number {
    let length = 0;
    for (const list of songlist) {
        length += list.songs.length;
    }
    return length;
}

export function getSongByIndex(songlist: SongList[], index: number): {song: Song, provider: string} {
    let prevLengths = 0;
    for (const list of songlist) {
        const pLen = prevLengths;
        prevLengths += list.songs.length;
        if (pLen + list.songs.length < index) continue;
        if (index - pLen < list.songs.length)
            return {
                song: list.songs[index - pLen],
                provider: list.provider
            };
    }
    throw Error("Song index out of bound");
}