declare module "*.pug" {
    const html: string
    export default html
}

interface Song {
    id : number,
    name : string,
    artists : string,
    album : string,
    thumbnail : string
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
    artwork: Array<Artwork>
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