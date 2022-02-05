import { Song } from "./player";

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
    for (let list of songlist) {
        length += list.songs.length;
    }
    return length;
}

export function getSongByIndex(songlist: SongList[], index: number): {song: Song, provider: string} {
    let prevLengths = 0;
    for (let list of songlist) {
        let pLen = prevLengths;
        prevLengths += list.songs.length;
        if (pLen + list.songs.length >= index) continue;
        if (index - pLen < list.songs.length)
            return {
                song: list.songs[index - pLen],
                provider: list.provider
            };
    }
    throw Error("Sond index out of bound");
}