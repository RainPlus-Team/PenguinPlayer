import Scrollbar from "smooth-scrollbar";

import { container as el } from "./player";
import { addEventListener, addEventListeners } from "./modules/event";

export let scrollBar: Scrollbar;
export let disableAutoScroll = false;

function findLyricByTime(lyric: LyricLine[], time: number): LyricLine {
    for (let line of lyric) {
        if (line.time == time) {return line;}
    }
    return null;
}

function createLine(line: LyricLine, tLine?: LyricLine) {
    let l = document.createElement("p");
    l.classList.add("penguin-player__lyric-settings--full-view-line");
    if (line.value == "" || line.value == "\n") {
        l.innerHTML = "&nbsp;";
    } else {
        l.append(line.value);
        if (tLine) {
            let t = document.createElement("span");
            t.classList.add("penguin-player__lyric-settings--full-view-line-translate");
            t.textContent = tLine.value;
            l.append(document.createElement("br"), t);
        }
    }
    return l;
}

addEventListener("fetchlyric", (_: Song) => {
    el.querySelector(".penguin-player__lyric-settings--full-view > .scroll-content").innerHTML = "";
});

addEventListener("lyricready", (_: Song, lrc?: LyricLine[], tLrc?: LyricLine[]) => {
    if (lrc) {
        let fullview = el.querySelector(".penguin-player__lyric-settings--full-view > .scroll-content");
        if (tLrc) {
            for (let line of lrc) {
                fullview.appendChild(createLine(line, findLyricByTime(tLrc, line.time)));
            }
        } else {
            for (let line of lrc) {
                fullview.appendChild(createLine(line));
            }
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
                break;
            case "touchend":
            case "touchcancel":
            case "mouseup":
            case "keyup":
            case "blur":
                disableAutoScroll = false;
                break;
            default:
                autoScrollTimeout = window.setTimeout(() => disableAutoScroll = false, 3000);
                disableAutoScroll = true;
                break;
        }
    }, false);
});