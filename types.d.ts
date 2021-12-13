declare module "*.svg" {
    const svg: import("preact").Component;
    export default svg
}

interface Song {
    provider: string,
    name: string,
    artists: string,
    album?: string,
    thumbnail?: string,
    thumbnailNoCrossOrigin?: boolean
}
interface NeteaseSong extends Song {
    id: string,
    album: string,
    thumbnail: string,
    duration: number
}
interface FileSong extends Song {
    url: string
}

interface LyricLine {
    time: number,
    value: string
}
interface Lyric {
    lrc: LyricLine[],
    translatedLrc: LyricLine[]
}

interface Artwork {
    src: string
    sizes?: string
}
interface MediaMetadataOptions {
    title: string
    artist: string
    album: string
    artwork: Artwork[]
}
interface TrialInfo {
    startTime: number
    endTime: number
}
declare class Color extends Array {
    0: number
    1: number
    2: number
}

interface SliderOptions {
    activeSelector: string
    barSelector: string
    innerSelector: string
    value?: number
}

interface AjaxPromise extends Promise<AjaxResponse> {
    method(method: "GET" | "POST"): AjaxPromise
    url(url: string): AjaxPromise
    send(): AjaxPromise
    cancel(): AjaxPromise
    then(callback: any): AjaxPromise
    catch(callback: any): AjaxPromise
    finally(callback: any): AjaxPromise
}
interface AjaxResponse {
    code: number
    data: any
}

interface PenguinPlayerAPI {
    initialize(id: string): void
    play(id: number): void
    pause(): void
    next(): void
    previous(): void
    addEventListener(name: string, handler: Function): void
    removeEventListener(name: string, handler: Function): void
    readonly paused: boolean
    readonly song: Song
    readonly duration: number
    currentTime: number
    volume: number
    readonly playlist: Song[]
}

interface PenguinPlayerOptions {
    playlist: string | Playlist[],
    autoplay?: boolean,
    startIndex?: number,
    overrideVolume?: number
    //overridePlaymode?: import("./src/typescript/controller").Playmodes
}

interface Provider {
    type: string,
    getPlaylist: (options: any) => Promise<Song[]>,
    getLyric?: (song: Song) => Promise<Lyric>,
    getUrl: (song: Song) => Promise<string>,
}

interface BasePlaylist {
    type: string,
    options: any
}


/// File Provider ///
interface FileProvider extends Provider {
    getPlaylist: (files: FilePlaylistItem[]) => Promise<Song[]>,
    getUrl: (file: FileSong) => Promise<string>
}
interface FilePlaylistItem {
    name: string,
    artists: string[],
    url: string,
    thumbnail?: string,
    album?: string
}

type FilePlaylist = BasePlaylist & {
    type: "file",
    options: FilePlaylistItem[]
}

/// Netease Provider ///
interface NeteaseProvider extends Provider {
    getPlaylist: (id: string) => Promise<Song[]>,
    getLyric: (song: NeteaseSong) => Promise<Lyric>,
    getUrl: (song: NeteaseSong) => Promise<string>
}
type NeteasePlaylist = BasePlaylist & {
    type: "netease",
    options: string
}

/// QQ Provider ///
interface QQProvider extends Provider {
    getPlaylist: (id: string) => Promise<Song[]>,
    getUrl: (song: QQSong) => Promise<string>
}
interface QQSong extends Song {
    id: string
}
type QQPlaylist = BasePlaylist & {
    type: "qq",
    options: string
}

type Playlist = FilePlaylist | NeteasePlaylist | QQPlaylist;