import { songs, currentSong } from "./controller";
import { print } from "./helper";
import ajax from "./modules/ajax";
import { container as el } from "./player";

let audio: HTMLAudioElement, mainEl: HTMLHeadingElement, subEl: HTMLHeadingElement;
window.addEventListener("penguininitialized", () => {
    audio = <HTMLAudioElement>el.querySelector(".penguin-player__audio");
    mainEl = <HTMLHeadingElement>el.querySelector(".penguin-player__lyric--main");
    subEl = <HTMLHeadingElement>el.querySelector(".penguin-player__lyric--sub");
    audio.addEventListener("playing", () => {
        lrcOffset = tLrcOffset = 0;
        lyricUpdate();
    });
});

let lyricReq: AjaxPromise, retryTimeout: any;

let lrc: Array<LyricLine>, tLrc: Array<LyricLine>, lrcOffset = 0, tLrcOffset = 0, lastMain: string, lastSub: string, lrcTimeout: any, subLrcTimeout: any;

function findLrcPos(lrc: Array<LyricLine>, time: number, offset = 0): number {
    for (let i = offset;i < lrc.length;i++) {
        if (lrc[i + 1] == null || lrc[i + 1].time > time * 1000) {
            return i;
        }
    }
    return -1;
}

function setElText(text: string, sub: boolean = false) {
    let [el, last, timeout] = sub ? [subEl, lastSub, subLrcTimeout] : [mainEl, lastMain, lrcTimeout];
    if (text == last) {return;}
    el.style.opacity = "0";
    clearTimeout(timeout);
    let id = setTimeout(() => {
        if (!text.replace(/\s/g, '').length) {
            el.innerHTML = "&nbsp;";
        } else {
            el.textContent = text;
        }
        el.style.opacity = "1";
    }, 100);
    if (sub) {lastSub = text;subLrcTimeout = id;} else {lastMain = text;lrcTimeout = id;}
}

function lyricUpdate() {
    if (audio.paused) {return;}
    let [main, sub] = ["", ""];
    if (!isNaN(audio.currentTime) && lrc != null && (lrcOffset = findLrcPos(lrc, audio.currentTime, lrcOffset)) != -1) {
        main = lrc[lrcOffset].value;
        if (tLrc && (tLrcOffset = findLrcPos(tLrc, audio.currentTime, tLrcOffset)) != -1) {
            sub = tLrc[tLrcOffset].value;
        } else if (lrcOffset != -1 && lrcOffset < lrc.length - 1) {
            sub = lrc[lrcOffset + 1].value;
        }
    }
    setElText(main);
    setElText(sub, true);
    requestAnimationFrame(lyricUpdate);
}

export function getLyric(song: Song) {
    lrc = tLrc = null;
    lrcOffset = tLrcOffset = 0;
    clearTimeout(retryTimeout);
    if (lyricReq) { lyricReq.cancel(); }
    lyricReq = ajax(`https://gcm.tenmahw.com/resolve/lyric?id=${song.id}`).then((result) => {
        if (result.data.lyric == null) {
            print(`No lyric for ${songs[currentSong].name}`);
        } else {
            lrc = result.data.lyric.lrc;
            tLrc = result.data.lyric.tlrc;
        }
    }).catch(() => {
        print("Cannot fetch lyric");
        retryTimeout = setTimeout(getLyric, 5000, song);
    });
}