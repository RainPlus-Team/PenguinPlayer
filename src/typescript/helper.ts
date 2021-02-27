export function getOffsetLeft(element: HTMLElement): number {
    let left=0;
    while(element) {
        left = left + element.offsetLeft;
        element = <HTMLElement>element.offsetParent;
    }
    return left;
}

export function formatTime(time: number): string {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}