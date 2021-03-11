import { getCurrentTime } from "./controller";
import { print } from "./helper";
import ajax from "./modules/ajax";
import { container as el } from "./player";

import tickIcon from "../icons/tick.svg";
import errorIcon from "../icons/error.svg";

let audio: HTMLAudioElement, lrcInfos = {
    main: <any>{},
    sub: <any>{}
};
window.addEventListener("penguininitialized", () => {
    audio = <HTMLAudioElement>el.querySelector(".penguin-player__audio");
    [lrcInfos.main.el, lrcInfos.sub.el] = [
        <HTMLHeadingElement>el.querySelector(".penguin-player__lyric--line[line-name=main]"),
        <HTMLHeadingElement>el.querySelector(".penguin-player__lyric--line[line-name=sub]")
    ];
    audio.addEventListener("playing", () => {
        lrcOffset = tLrcOffset = 0;
        lyricUpdate();
    });
    window.addEventListener("click", (e: MouseEvent) => {
        if (e.target instanceof HTMLElement && el.querySelector(".penguin-player__lyric-settings").classList.contains("penguin-player__lyric-settings-shown") && (<HTMLElement>e.target).closest(".penguin-player__lyric-settings") == null) {
            toggleSettings();
        }
        if (e.pageY >= window.innerHeight - 60 && e.pageX >= 56 + 20 && el.querySelector(".penguin-player__player").clientWidth <= 56 && window.innerWidth <= 700) {
            lyricTap();
            e.preventDefault();
        }
    });
    (<HTMLDivElement>el.querySelector(".penguin-player__lyric--expand-button")).addEventListener("click", () => toggleSettings());
    el.querySelector(".penguin-player__lyric-settings--overlay").addEventListener("click", () => toggleSettings(false));
});

let lastTap: number;
function lyricTap() {
    var now = new Date().getTime();
    var timesince = now - lastTap;
    if ((timesince < 600) && (timesince > 0)) {
        toggleSettings();
    }
    lastTap = new Date().getTime();
}

let lyricReq: AjaxPromise, retryTimeout: any;

let lrc: LyricLine[], tLrc: LyricLine[], lrcOffset = 0, tLrcOffset = 0;

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
    if (!isNaN(audio.currentTime) && (lrcOffset = findLrcPos(lrc, getCurrentTime(), lrcOffset)) != -1) {
        main = lrc[lrcOffset].value;
        if ((tLrcOffset = findLrcPos(tLrc, getCurrentTime(), tLrcOffset)) != -1) {
            sub = tLrc[tLrcOffset].value;
        } else {
            sub = lrc[lrcOffset + 1]?.value || "";
        }
    }
    setElText(main);
    setElText(sub, "sub");
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
        [el.querySelector(".penguin-player__lyric-settings--status-tlrc-icon").innerHTML, el.querySelector(".penguin-player__lyric-settings--status-tlrc-text").textContent] = "";
    }
}

export function getLyric(song: Song) {
    setLyricStatus("error", "歌词加载中");
    lrc = tLrc = null;
    lrcOffset = tLrcOffset = 0;
    clearTimeout(retryTimeout);
    if (lyricReq) { lyricReq.cancel(); }
    lyricReq = ajax(`https://gcm.tenmahw.com/resolve/lyric?id=${song.id}`).send().then((result) => {
        let lyric = result.data?.lyric;
        lrc = lyric?.lrc;
        tLrc = lyric?.tlrc;
        setLyricStatus.apply(null, lrc ? ["tick", "歌词已加载"].concat(tLrc ? ["tick", "翻译歌词已加载"] : ["error", "无翻译歌词"]) : ["error", "无歌词"]);
    }).catch(() => {
        print("Cannot fetch lyric");
        retryTimeout = setTimeout(getLyric, 5000, song);
    });
}