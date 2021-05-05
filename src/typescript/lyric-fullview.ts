import Scrollbar from "smooth-scrollbar";

import { container as el } from "./player";
import { addEventListener } from "./modules/event";

function findLyricByTime(lyric: LyricLine[], time: number): LyricLine {
    for (let line of lyric) {
        if (line.time == time) {return line;}
    }
    return null;
}

function createLine(line: LyricLine, tLine?: LyricLine) {
    let l = document.createElement("p");
    l.classList.add("penguin-player__lyric-settings--full-view-line");
    l.append(line.value);
    if (tLine) {
        l.append(document.createElement("br"), tLine.value);
    }
    return l;
}

addEventListener("fetchlyric", (song: Song) => {
    el.querySelector(".penguin-player__lyric-settings--full-view > .scroll-content").innerHTML = "";
});

addEventListener("lyricready", (song: Song, lrc?: LyricLine[], tLrc?: LyricLine[]) => {
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
});

addEventListener("initialized", () => {
    let fullview: HTMLElement = el.querySelector(".penguin-player__lyric-settings--full-view");
    Scrollbar.init(fullview);
});