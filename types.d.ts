declare module "*.svg" {
    const svg: new() => import("preact").Component<{className?: string, preserveAspectRatio?: string}>;
    export default svg;
}

declare module "*.jpg" {
    const path: string;
    export default path;
}
declare module "*.ogg" {
    const path: string;
    export default path;
}

declare module "*?raw" {
    const content: string;
    export default content;
}

declare const _VERSION_: string;
declare const _BUILD_DATE_: string;

type Theme = import("preact").Component<PPlayerLayoutProps, PPlayerLayoutState>;

interface PenguinPlayerOptions {
    parent?: HTMLElement
    fixed?: boolean
    volume?: number
    autoplay?: boolean | "auto"
    song?: number
    theme?: new () => Theme
    lists?: import("./src/playlist").Playlist[]
    enforceHttps?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PPlayerLayoutState {

}

interface PPlayerLayoutProps {
    options: PenguinPlayerOptions
    player: import("./src/player").Player
}

interface MediaArtwork {
    sizes: string,
    src: string,
    type: string
}