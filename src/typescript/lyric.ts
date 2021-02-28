import axios, { CancelTokenSource } from "axios";
import { songs, currentSong } from "./controller";
import { print } from "./helper";
import { container as el } from "./player";

let audio: HTMLAudioElement, mainEl: HTMLHeadingElement, subEl: HTMLHeadingElement;
window.addEventListener("penguininitialized", () => {
    audio = <HTMLAudioElement>el.querySelector(".penguin-player__audio");
    mainEl = <HTMLHeadingElement>el.querySelector(".penguin-player__lyric--main");
    subEl = <HTMLHeadingElement>el.querySelector(".penguin-player__lyric--sub");
    audio.addEventListener("playing", lyricUpdate);
});

let axiosToken: CancelTokenSource, retryTimeout: number;

let lrc: Array<LyricLine>, tLrc: Array<LyricLine>, lrcOffset = 0, tLrcOffset = 0, lastMain: string, lastSub: string, lrcTimeout: number, subLrcTimeout: number;

function findLrcPos(lrc: Array<LyricLine>, time: number, offset = 0): number {
    for (let i = offset;i < lrc.length;i++) {
        if (lrc[i + 1] == null || lrc[i + 1].time > time * 1000) {
            return i;
        }
    }
    return -1;
}

function setElText(el: HTMLElement, text: string) {
    if (text == "") {
        el.innerHTML = "&nbsp;";
    } else {
        el.textContent = text;
    }
    el.style.opacity = "1";
}

function setMain(text: string = "") {
    if (text == lastMain) {return;}
    mainEl.style.opacity = "0";
    clearTimeout(lrcTimeout);
    lrcTimeout = setTimeout(setElText, 100, mainEl, text);
    lastMain = text;
}

function setSub(text: string = "") {
    if (text == lastSub) {return;}
    subEl.style.opacity = "0";
    clearTimeout(subLrcTimeout);
    subLrcTimeout = setTimeout(setElText, 100, subEl, text);
    lastSub = text;
}

function lyricUpdate() {
    if (audio.paused) {return;}
    let main = "", sub = "";
    if (!isNaN(audio.currentTime) && lrc != null) {
        let mainPos = findLrcPos(lrc, audio.currentTime, lrcOffset);
        if (mainPos != -1) {
            main = lrc[mainPos].value;
            if (tLrc) {
                let subPos = findLrcPos(tLrc, audio.currentTime, tLrcOffset);
                if (subPos != -1) {
                    sub = tLrc[subPos].value;
                    tLrcOffset = subPos;
                }
            } else if (mainPos < lrc.length - 1) {
                sub = lrc[mainPos + 1].value;
            }
        }
    }
    setMain(main);
    setSub(sub);
    requestAnimationFrame(lyricUpdate);
}

export function getLyric(song: Song) {
    lrc = tLrc = null;
    lrcOffset = tLrcOffset = 0;
    clearTimeout(retryTimeout);
    if (axiosToken) {axiosToken.cancel("Fetch new lyric");}
    axiosToken = axios.CancelToken.source();
    axios.get(`https://gcm.tenmahw.com/resolve/lyric?id=${song.id}`, { cancelToken: axiosToken.token }).then((result) => {
        if (result.data.lyric == null) {
            print(`No lyric for ${songs[currentSong].name}`);
        } else {
            lrc = result.data.lyric.lrc;
            tLrc = result.data.lyric.tLrc;
        }
    }).catch((err) => {
        if (!axios.isCancel(err)) {
            print("Cannot fetch lyric");
            retryTimeout = setTimeout(getLyric, 5000, song);
        }
    });
}