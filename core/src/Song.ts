export interface SongInfo {
    name: string,
    artists: string,
}

export interface ThumbnailedSongInfo extends SongInfo {
    thumbnail: string
}

export interface AlbumSongInfo extends SongInfo {
    album: string
}

export default interface Song {
    getSongInfo(): Promise<SongInfo>
    getSongURL(): Promise<string>
}

/* Type Guards */
export function isThumbnailed(songInfo: SongInfo): boolean {
    return (songInfo as ThumbnailedSongInfo).thumbnail !== undefined;
}
export function hasAlbum(songInfo: SongInfo): boolean {
    return (songInfo as AlbumSongInfo).album !== undefined;
}
