export interface SongInfo {
    name: string,
    artists: string,
}

export interface ThumbnailedSongInfo extends SongInfo {
    thumbnail: string
}

export default interface Song {
    getSongInfo(): Promise<SongInfo>
    getSongURL(): Promise<string>
}

/* Type Guards */
export function isThumbnailed(songInfo: SongInfo): boolean {
    return (songInfo as ThumbnailedSongInfo) !== undefined;
}