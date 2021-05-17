import { container as el } from "./player";
import { lyricFullviewUpdate } from "./lyric";
import { scrollBar as fullviewScrollbar } from "./lyric-fullview";

import tickIcon from "../icons/tick.svg";
import errorIcon from "../icons/error.svg";

let settingsHideTimeout: number;
export function toggleSettings(show?: boolean) {
    let settings = (<HTMLDivElement>el.querySelector(".penguin-player__lyric-settings"));
    show = typeof show === "boolean" ? show : settings.style.display != "block";
    if (show) {
        clearTimeout(settingsHideTimeout);
        settings.style.display = "block";
        setTimeout(() => [settings.style.transform, settings.style.opacity] = ["translate(0)", "1"]);
        settings.classList.add("penguin-player__lyric-settings-shown");
        fullviewScrollbar.update();
        lyricFullviewUpdate();
    } else {
        [settings.style.transform, settings.style.opacity] = ["translate(10px)", "0"];
        settingsHideTimeout = window.setTimeout(() => settings.style.display = "none", 200);
        settings.classList.remove("penguin-player__lyric-settings-shown");
    }
}

export function setLyricStatus(icon: "error" | "tick", text: string, tIcon?: "error" | "tick", tText?: string) {
    el.querySelector(".penguin-player__lyric-settings--status-lrc-icon").innerHTML = icon == "error" ? errorIcon : tickIcon;
    el.querySelector(".penguin-player__lyric-settings--status-lrc-text").textContent = text;
    if (tIcon && tText) {
        el.querySelector(".penguin-player__lyric-settings--status-tlrc-icon").innerHTML = tIcon == "error" ? errorIcon : tickIcon;
        el.querySelector(".penguin-player__lyric-settings--status-tlrc-text").textContent = tText;
    } else
        [el.querySelector(".penguin-player__lyric-settings--status-tlrc-icon").innerHTML, el.querySelector(".penguin-player__lyric-settings--status-tlrc-text").textContent] = ["", ""];
}