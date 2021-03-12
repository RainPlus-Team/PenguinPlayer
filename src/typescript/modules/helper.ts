/// #if IE_SUPPORT
const Modernizr = require("../../../vendor/modernizr");
/// #endif

export function getPropertySum(element: HTMLElement, name: string): number {
    let prop = 0;
    while(element) {
        prop = prop + element[name];
        element = <HTMLElement>element.offsetParent;
    }
    return prop;
}

export function formatTime(time: number): string {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function print(text: string) {
    console.log("%cPPlayer%c" + text,"border-top-left-radius:5px;border-bottom-left-radius:5px;padding:0 5px;font-size:24px;font-family:'Microsoft YaHei Light','Microsoft YaHei';background-color:darkred;color:white;","border-top-right-radius:5px;border-bottom-right-radius:5px;padding:5px;padding-top:10px;padding-bottom:2px;font-size:14px;font-family:'Microsoft YaHei Light','Microsoft YaHei';background-color:pink;color:darkred;margin:5px;margin-left:0;");
}

export function deepEventHandler(element: HTMLElement, ...args: any[]) {
    element.addEventListener.apply(element, args);

    [].forEach.call(element.childNodes, (child: ChildNode) => {
        deepEventHandler(<HTMLElement>child, ...args);
    });
}

/// #if IE_SUPPORT
export function isBlurSupported() {
    return Modernizr.testAllProps("backdropFilter", "blur(5px)");
}
/// #endif