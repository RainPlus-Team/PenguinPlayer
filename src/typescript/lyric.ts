import { getCurrentTime } from "./controller";
import { api, container as el } from "./player";

import { addEventListener, dispatchEvent, fireEvent } from "./modules/event";
import { getProvider } from "./modules/provider";
import { print } from "./modules/helper";
/// #if IE_SUPPORT
import { inputStep } from "./modules/helper";
/// #endif

import { disableAutoScroll, scrollBar as fullviewScrollbar } from "./lyric-fullview";
import { setLyricStatus, toggleSettings } from "./lyric-settings";
import CancelablePromise from "./modules/cancelable-promise";

export let lyricOffset = 0;

let audio: HTMLAudioElement, lrcInfos = {
    main: <any>{},
    sub: <any>{}
};
addEventListener("setup", () => {
    audio = <HTMLAudioElement>el.querySelector(".penguin-player__audio");
    [lrcInfos.main.el, lrcInfos.sub.el] = [
        <HTMLHeadingElement>el.querySelector(".penguin-player__lyric--line[line-name=main]"),
        <HTMLHeadingElement>el.querySelector(".penguin-player__lyric--line[line-name=sub]")
    ];
    audio.addEventListener("playing", () => {
        lrcOffset = tLrcOffset = 0;
        lyricUpdate();
    });
    window.addEventListener("mousedown", (e: MouseEvent) => {
        if (el.querySelector(".penguin-player__lyric-settings").classList.contains("penguin-player__lyric-settings-shown")) {
            if (e.target instanceof HTMLElement && (<HTMLElement>e.target).closest(".penguin-player__lyric-settings") == null)
                toggleSettings();
        } else {
            let bounding = el.querySelector(".penguin-player__lyric").getBoundingClientRect();
            if (e.pageX > bounding.left && e.pageX < bounding.right && e.pageY > bounding.top && e.pageY < bounding.bottom && window.innerWidth <= 700) {
                lyricTap();
                e.preventDefault();
            }
        }
    });
    // Lyric settings menu setup
    (<HTMLDivElement>el.querySelector(".penguin-player__lyric--expand-button")).addEventListener("click", () => toggleSettings());
    el.querySelector(".penguin-player__lyric-settings--overlay").addEventListener("click", () => toggleSettings(false));
    let offsetField: HTMLInputElement = el.querySelector(".penguin-player__lyric-settings--lyric-offset-value");
    /// #if IE_SUPPORT
    el.querySelector(".penguin-player__lyric-settings--lyric-offset-up").addEventListener("click", () => {inputStep(offsetField); fireEvent(offsetField, "change");});
    el.querySelector(".penguin-player__lyric-settings--lyric-offset-down").addEventListener("click", () => {inputStep(offsetField, "down"); fireEvent(offsetField, "change");});
    /// #else
    el.querySelector(".penguin-player__lyric-settings--lyric-offset-up").addEventListener("click", () => {offsetField.stepUp(); fireEvent(offsetField, "change");});
    el.querySelector(".penguin-player__lyric-settings--lyric-offset-down").addEventListener("click", () => {offsetField.stepDown(); fireEvent(offsetField, "change");});
    /// #endif
    offsetField.addEventListener("change", function() {
        let offset = Number(this.value);
        lyricOffset = isNaN(offset) ? lyricOffset : offset;
        lrcOffset = tLrcOffset = 0;
    });
    addEventListener("songchange", () => {lyricOffset = (<any>offsetField.value) = 0;});
});

let lastTap: number;
function lyricTap() {
    let now = new Date().getTime();
    let timesince = now - lastTap;
    if ((timesince < 600) && (timesince > 0))
        toggleSettings();
    lastTap = new Date().getTime();
}

let retryTimeout: number;

let lrc: LyricLine[], tLrc: LyricLine[], lrcOffset = 0, lastLrcOffset = -1, tLrcOffset = 0;

function findLrcPos(lrc: LyricLine[], time: number, offset = 0): number {
    if (!lrc) return -1
    for (let i = offset;i < lrc.length;i++)
        if (lrc[i + 1] == null || lrc[i + 1].time > time * 1000)
            return i;
    return -1;
}

function setElText(text: string, name: string = "main") {
    let l = lrcInfos[name];
    if (text == l.last) return;
    l.el.style.opacity = "0";
    clearTimeout(l.timeout);
    l.timeout = setTimeout(() => {
        if (!text.replace(/\s/g, '').length)
            l.el.innerHTML = "&nbsp;";
        else
            l.el.textContent = text;
        l.el.style.opacity = "1";
    }, 100);
    l.last = text;
}

function lyricUpdate() {
    if (audio.paused) return;
    let [main, sub] = ["", ""];
    if (!isNaN(audio.currentTime) && (lrcOffset = findLrcPos(lrc, getCurrentTime() + lyricOffset, lrcOffset)) != -1) {
        main = lrc[lrcOffset].value;
        if ((tLrcOffset = findLrcPos(tLrc, getCurrentTime() + lyricOffset, tLrcOffset)) != -1)
            sub = tLrc[tLrcOffset].value;
        else
            sub = lrc[lrcOffset + 1]?.value || "";
    }
    setElText(main);
    setElText(sub, "sub");
    lyricFullviewUpdate();
    (<HTMLDivElement>el.querySelector(".penguin-player__lyric--background")).style.bottom = (main != "" || sub != "") ? "" : "-60px";
    requestAnimationFrame(lyricUpdate);
}

export function lyricFullviewUpdate(force: boolean = false) {
    if (lrcOffset != lastLrcOffset || force) {
        let fullview = el.querySelector(".penguin-player__lyric-settings--full-view > .scroll-content");
        fullview.querySelectorAll(".penguin-player__lyric-settings--full-view-line-active").forEach((el) => 
            el.classList.remove("penguin-player__lyric-settings--full-view-line-active")
        );
        let line = <HTMLElement>fullview.querySelectorAll(".penguin-player__lyric-settings--full-view-line")[lrcOffset];
        if (line) {
            line.classList.add("penguin-player__lyric-settings--full-view-line-active");
            if (!disableAutoScroll || force)
                fullviewScrollbar.scrollIntoView(line, {
                    offsetTop: el.querySelector(".penguin-player__lyric-settings--full-view").clientHeight / 2 - line.clientHeight / 2
                });
        }
        lastLrcOffset = lrcOffset;
    }
}

let lastLyricPromise: CancelablePromise<void> | Promise<void>;

export function getLyric(song: Song) {
    if (lastLyricPromise instanceof CancelablePromise) lastLyricPromise.cancel();
    dispatchEvent("fetchlyric", song);
    lrc = tLrc = null;
    lrcOffset = tLrcOffset = 0;
    lastLrcOffset = -1;
    if (typeof getProvider(song.provider).getLyric !== "function") {
        setLyricStatus("error", "此平台不支持歌词显示");
        return;
    }
    clearTimeout(retryTimeout);
    setLyricStatus("error", "歌词加载中");
    lastLyricPromise = getProvider(song.provider).getLyric(song).then((res) => {
        if (api.song != song) return;
        [lrc, tLrc] = [res.lrc, res.translatedLrc];
        setLyricStatus.apply(null, lrc ? ["tick", "歌词已加载"].concat(tLrc ? ["tick", "翻译歌词已加载"] : ["error", "无翻译歌词"]) : ["error", "无歌词"]);
        dispatchEvent("lyricready", song, lrc, tLrc);
        (<HTMLDivElement>el.querySelector(".penguin-player__lyric--background")).style.bottom = lrc ? "" : "-60px";
    }).catch(() => {
        print("Can't fetch Netease lyric");
        retryTimeout = window.setTimeout(getLyric, 5000, song);
    });
}