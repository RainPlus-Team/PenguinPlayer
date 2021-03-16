declare module "*.pug" {
    const html: string
    export default html
}
declare module "*.svg" {
    const svg: string
    export default svg
}

interface Song {
    id: number,
    name: string,
    artists: string,
    album: string,
    thumbnail: string,
    duration: number
}
interface LyricLine {
    time: number,
    value: string
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
    start: number
    end: number
}
declare class MediaMetadata {
    constructor(options: MediaMetadataOptions)
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

interface ThemeColorChangeEvent {
    color: Color
    palette: Color[]
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