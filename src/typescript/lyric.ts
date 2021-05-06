import { getCurrentTime } from "./controller";
import { print } from "./modules/helper";
import ajax from "./modules/ajax";
import { container as el } from "./player";

import tickIcon from "../icons/tick.svg";
import errorIcon from "../icons/error.svg";
import { addEventListener, dispatchEvent, fireEvent } from "./modules/event";
/// #if IE_SUPPORT
import { inputStep } from "./modules/helper";
/// #endif

import { disableAutoScroll, scrollBar as fullviewScrollbar } from "./lyric-fullview";

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
            if (e.target instanceof HTMLElement && (<HTMLElement>e.target).closest(".penguin-player__lyric-settings") == null) {
                toggleSettings();
            }
        } else {
            if (e.pageY >= window.innerHeight - 60 && e.pageX >= 56 + 20 && el.querySelector(".penguin-player__player").clientWidth <= 56 && window.innerWidth <= 700) {
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
        //localStorage.setItem("penguinplayer_lyric_offset", offset.toString());
    });
    addEventListener("songchange", () => {lyricOffset = (<any>offsetField.value) = 0;});
    // Well, this shouldn't be saved
    /*if (localStorage.getItem("penguinplayer_lyric_offset") != null) {
        let offset = Number(localStorage.getItem("penguinplayer_lyric_offset"));
        if (isNaN(offset)) {
            localStorage.setItem("penguinplayer_lyric_offset", "0");
        } else {
            lyricOffset = (<any>offsetField.value) = offset;
        }
    }*/
});

let lastTap: number;
function lyricTap() {
    let now = new Date().getTime();
    let timesince = now - lastTap;
    if ((timesince < 600) && (timesince > 0)) {
        toggleSettings();
    }
    lastTap = new Date().getTime();
}

let lyricReq: AjaxPromise, retryTimeout: any;

let lrc: LyricLine[], tLrc: LyricLine[], lrcOffset = 0, lastLrcOffset = -1, tLrcOffset = 0;

function findLrcPos(lrc: LyricLine[], time: number, offset = 0): number {
    if (!lrc) {return -1;}
    for (let i = offset;i < lrc.length;i++) {
        if (lrc[i + 1] == null || lrc[i + 1].time > time * 1000) {
            return i;
        }
    }
    return -1;
}

function setElText(text: string, name: string = "main") {
    let l = lrcInfos[name];
    if (text == l.last) { return; }
    l.el.style.opacity = "0";
    clearTimeout(l.timeout);
    l.timeout = setTimeout(() => {
        if (!text.replace(/\s/g, '').length) {
            l.el.innerHTML = "&nbsp;";
        } else {
            l.el.textContent = text;
        }
        l.el.style.opacity = "1";
    }, 100);
    l.last = text;
}

function lyricUpdate() {
    if (audio.paused) { return; }
    let [main, sub] = ["", ""];
    if (!isNaN(audio.currentTime) && (lrcOffset = findLrcPos(lrc, getCurrentTime() + lyricOffset, lrcOffset)) != -1) {
        main = lrc[lrcOffset].value;
        if ((tLrcOffset = findLrcPos(tLrc, getCurrentTime() + lyricOffset, tLrcOffset)) != -1) {
            sub = tLrc[tLrcOffset].value;
        } else {
            sub = lrc[lrcOffset + 1]?.value || "";
        }
    }
    setElText(main);
    setElText(sub, "sub");
    if (lrcOffset != lastLrcOffset) {
        let fullview = el.querySelector(".penguin-player__lyric-settings--full-view > .scroll-content");
        fullview.querySelectorAll(".penguin-player__lyric-settings--full-view-line-active").forEach((el) => {
            el.classList.remove("penguin-player__lyric-settings--full-view-line-active");
        });
        let line = <HTMLElement>fullview.children[lrcOffset];
        if (line) {
            line.classList.add("penguin-player__lyric-settings--full-view-line-active");
            if (!disableAutoScroll) {
                fullviewScrollbar.scrollIntoView(line, {
                    offsetTop: el.querySelector(".penguin-player__lyric-settings--full-view").clientHeight / 2 - line.clientHeight / 2
                });
            }
        }
        lastLrcOffset = lrcOffset;
    }
    (<HTMLDivElement>el.querySelector(".penguin-player__lyric--background")).style.bottom = (main != "" || sub != "") ? "" : "-60px";
    requestAnimationFrame(lyricUpdate);
}

let settingsHideTimeout: any;
function toggleSettings(show?: boolean) {
    let settings = (<HTMLDivElement>el.querySelector(".penguin-player__lyric-settings"));
    show = typeof show === "boolean" ? show : settings.style.display != "block";
    if (show) {
        clearTimeout(settingsHideTimeout);
        settings.style.display = "block";
        setTimeout(() => [settings.style.transform, settings.style.opacity] = ["translate(0)", "1"]);
        settings.classList.add("penguin-player__lyric-settings-shown");
        fullviewScrollbar.update();
    } else {
        [settings.style.transform, settings.style.opacity] = ["translate(10px)", "0"];
        settingsHideTimeout = setTimeout(() => settings.style.display = "none", 200);
        settings.classList.remove("penguin-player__lyric-settings-shown");
    }
}

function setLyricStatus(icon: "error" | "tick", text: string, tIcon?: "error" | "tick", tText?: string) {
    el.querySelector(".penguin-player__lyric-settings--status-lrc-icon").innerHTML = icon == "error" ? errorIcon : tickIcon;
    el.querySelector(".penguin-player__lyric-settings--status-lrc-text").textContent = text;
    if (tIcon && tText) {
        el.querySelector(".penguin-player__lyric-settings--status-tlrc-icon").innerHTML = tIcon == "error" ? errorIcon : tickIcon;
        el.querySelector(".penguin-player__lyric-settings--status-tlrc-text").textContent = tText;
    } else {
        [el.querySelector(".penguin-player__lyric-settings--status-tlrc-icon").innerHTML, el.querySelector(".penguin-player__lyric-settings--status-tlrc-text").textContent] = ["", ""];
    }
}

export function getLyric(song: Song) {
    setLyricStatus("error", "歌词加载中");
    lrc = tLrc = null;
    lrcOffset = tLrcOffset = 0;
    lastLrcOffset = -1;
    clearTimeout(retryTimeout);
    if (lyricReq) { lyricReq.cancel(); }
    lyricReq = ajax(`https://gcm.tenmahw.com/resolve/lyric?id=${song.id}`).send().then((result: AjaxResponse) => {
        let lyric = result.data?.lyric;
        lrc = lyric?.lrc;
        tLrc = lyric?.tlrc;
        dispatchEvent("lyricready", song, lrc, tLrc);
        setLyricStatus.apply(null, lrc ? ["tick", "歌词已加载"].concat(tLrc ? ["tick", "翻译歌词已加载"] : ["error", "无翻译歌词"]) : ["error", "无歌词"]);
        (<HTMLDivElement>el.querySelector(".penguin-player__lyric--background")).style.bottom = lrc ? "" : "-60px";
    }).catch(() => {
        print("Cannot fetch lyric");
        retryTimeout = setTimeout(getLyric, 5000, song);
    });
    dispatchEvent("fetchlyric", song);
}