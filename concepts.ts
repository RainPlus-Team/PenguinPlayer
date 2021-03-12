export {};

interface IMusicProvider {
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

interface ISong {
    platformID: string
    name: string
    artists: string[]
}

interface ILyric {
    lyric: ILyricLine
    translateLyric: ILyricLine
}

interface ILyricLine {
    time: number,
    value: string
}

declare global {
    interface Window {
        PPlayer: PenguinPlayerAPI
    }
}

interface ISongLocation {
    playlistID: string

}

interface IPlaylist {
    platformID: string
    playlistID: string
    data: any
}

interface PenguinPlayerOptions {
    playlists: string | (IPlaylist | string)[]
}

interface PenguinPlayerAPI {
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

// Netease //
interface INeteaseTrialInfo {
    startTime: number
    endTime: number
}

interface NeteaseSong extends ISong {
    id: string
    duration: number
    thumbnail: string
    trialInfo?: INeteaseTrialInfo
}