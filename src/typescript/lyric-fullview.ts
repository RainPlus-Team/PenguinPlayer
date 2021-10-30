import Scrollbar from "smooth-scrollbar";

import { container as el } from "./player";
import { lyricFullviewUpdate } from "./lyric";
import { addEventListener, addEventListeners } from "./modules/event";
import { createLine } from "./modules/element-helper";

export let scrollBar: Scrollbar;
export let disableAutoScroll = false;

let settings: HTMLElement;

function findLyricByTime(lyric: LyricLine[], time: number): LyricLine {
    for (let line of lyric)
        if (line.time == time) return line;
    return null;
}

addEventListener("setup", () => {
    settings = (<HTMLDivElement>el.querySelector(".penguin-player__lyric-settings"));
})

addEventListener("fetchlyric", (_: Song) => 
    el.querySelector(".penguin-player__lyric-settings--full-view > .scroll-content").innerHTML = ""
);

addEventListener("lyricready", (_: Song, lrc?: LyricLine[], tLrc?: LyricLine[]) => {
    if (lrc) {
        let fullview = el.querySelector(".penguin-player__lyric-settings--full-view > .scroll-content");
        if (tLrc)
            for (let line of lrc)
                fullview.appendChild(createLine(line, findLyricByTime(tLrc, line.time)));
        else
            for (let line of lrc)
                fullview.appendChild(createLine(line));
        if (fullview.children.length > 0) {
            let placeholder = document.createElement("p");
            placeholder.innerHTML = "&nbsp;";
            placeholder.style.margin = "0";
            fullview.insertBefore(placeholder, fullview.children[0]);
            fullview.appendChild(placeholder.cloneNode(true));
        }
    }
    scrollBar.update();
});

addEventListener("initialized", () => {
    let fullview: HTMLElement = el.querySelector(".penguin-player__lyric-settings--full-view");
    let autoScrollTimeout: number;
    scrollBar = Scrollbar.init(fullview, {
        alwaysShowTracks: true
    });
    addEventListeners(fullview, "keydown keyup click mousedown mouseup blur selectstart scroll touchstart touchcancel touchend wheel mousewheel", (e) => {
        clearTimeout(autoScrollTimeout);
        switch (e.type) {
            case "touchstart":
            case "mousedown":
            case "keydown":
                disableAutoScroll = true;
                // This requires continuously disabling
                break;
            case "touchend":
            case "touchcancel":
            case "mouseup":
            case "keyup":
            case "blur":
                disableAutoScroll = false;
                // When continuously event stops, enables the auto scroll
                break;
            default:
                autoScrollTimeout = window.setTimeout(() => {
                    disableAutoScroll = false;
                    if (settings.style.display == "block")
                        lyricFullviewUpdate();
                }, 3000);
                disableAutoScroll = true;
                // This doesn't requires continuously disabling
                break;
        }
    }, false);
});