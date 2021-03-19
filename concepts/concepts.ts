export interface IMusicProvider {
    readonly name: string
    getPlaylist(options: any): Promise<ISong[]>
    getLyric(song: ISong): Promise<ILyric>
    getThumbnail(song: ISong): Promise<string>
    readonly isReady: boolean
    play(song?: ISong): void
    pause(): void
    readonly duration: number
    currentTime: number
    readonly paused: boolean
    initialize(): Promise<boolean>
    destroy(): void
}

export interface ISong {
    platformID: string
    name: string
    artists: string[]
}

export interface ILyric {
    lyric: ILyricLine
    translateLyric: ILyricLine
}

export interface ILyricLine {
    time: number,
    value: string
}

declare global {
    interface Window {
        PPlayer: PenguinPlayerAPI
    }
}

export interface ISongLocation {
    playlistID: string

}

export interface IPlaylist {
    platformID: string
    playlistID: string
    data: any
}

export interface PenguinPlayerOptions {
    playlists: string | (IPlaylist | string)[]
    acrossPlaylists?: boolean
    overrideVolume?: number
    overridePlaymode?: "list" | "list-loop" | "single-loop" | "random"
}

export interface PenguinPlayerAPI {
    initialize(options: PenguinPlayerOptions): Promise<boolean>
    play(song?: ISongLocation): void
    pause(): void
    readonly paused: boolean
    readonly song: ISong
    readonly duration: number
    currentTime: number
    readonly providers: object
    getProvider(id: string): IMusicProvider
    addProvider(id: string, provider: IMusicProvider, iconHtml?: string): Promise<boolean>
    addPlaylist(providerID: string, options: any): Promise<boolean>
}