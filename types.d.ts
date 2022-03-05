declare module "*.svg" {
    const svg: new() => import("preact").Component<{className?: string}>;
    export default svg
}

type Theme = import("preact").Component<PPlayerLayoutProps, PPlayerLayoutState>;

interface PenguinPlayerOptions {
    parent?: HTMLElement
    fixed?: boolean
    volume?: number
    autoplay?: boolean
    song?: number
    theme?: new () => Theme
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

interface PPlayerLayoutState {

}

interface PPlayerLayoutProps {
    options: PenguinPlayerOptions
    player: import("./src/ts/player").Player
    currentTime: number
    duration: number
    song: import("./src/ts/player").Song
}