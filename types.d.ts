declare module "*.svg" {
    const svg: new() => import("preact").Component<{className?: string, preserveAspectRatio?: string}>;
    export default svg
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
}

interface PPlayerLayoutState {

}

interface PPlayerLayoutProps {
    options: PenguinPlayerOptions
    player: import("./src/ts/player").Player
}