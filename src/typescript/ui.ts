import Scrollbar from "smooth-scrollbar";
/// #if IE_SUPPORT
const StackBlur = require("stackblur-canvas");
/// #endif

import { findHighContrastColor } from "./modules/color";
import cookie from "./modules/cookie";
import { dispatchEvent } from "./modules/event";
import { container as el } from "./player";
import Slider from "./modules/slider";
import { currentSong, getRealDuration, songs, trialInfo } from "./controller";

export let volumeSlider: Slider;
export let progressSlider: Slider;

window.addEventListener("penguininitialized", () => {
    let audio: HTMLAudioElement = el.querySelector(".penguin-player__audio");
    /// #if IE_SUPPORT

    /// #endif
    // Progress bar setup
    let playerOldState: boolean;
    progressSlider = new Slider({
        activeSelector: ".penguin-player__player--progress",
        barSelector: ".penguin-player__player--progress-bar",
        innerSelector: ".penguin-player__player--progress-inner",
        value: 0
    });
    progressSlider.addEventHandler("begindrag", () => {
        playerOldState = audio.paused;
        audio.pause();
    });
    progressSlider.addEventHandler("enddrag", () => {
        if (!playerOldState) {audio.play();}
    });
    progressSlider.addEventHandler("valuechange", (value: number) => {
        let fullTime = songs[currentSong].duration * value;
        if (trialInfo?.start > fullTime || trialInfo?.end < fullTime) {
            return true;
        } else {
            audio.currentTime = getRealDuration() * value;
        }
    });
    // Volume bar setup
    volumeSlider = new Slider({
        activeSelector: ".penguin-player__player--controls-volume",
        barSelector: ".penguin-player__player--controls-volume-bar",
        innerSelector: ".penguin-player__player--controls-volume-inner"
    });
    volumeSlider.addEventHandler("valuechange", (value: number) => {
        audio.volume = value;
        cookie.setItem("penguin_volume", value, Infinity);
    });
    Scrollbar.init(el.querySelector(".penguin-player__player--playlist"), { damping: 0.15 });
});

export function setCircleProgress(progress: number) {
    let prog = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress"));
    let left = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-left"));
    let right = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-right"));
    if (progress <= 50) {
        prog.style.clip = "";
        left.style.transform = "rotate(0deg)";
        right.style.transform = `rotate(${progress / 50 * 180}deg)`;
    } else {
        prog.style.clip = "auto";
        left.style.transform = `rotate(${progress / 100 * 360}deg)`;
        right.style.transform = "rotate(180deg)";
    }
}

export function setThemeColor(color: Color, palette: Array<Color>) {
    let backgroundRgba = `rgba(${color.join(", ")}, 0.5)`;
    let foregroundRgb = `rgb(${findHighContrastColor(color, palette).join(", ")})`;
    let player: HTMLDivElement = el.querySelector(".penguin-player__player");
    player.style.backgroundColor = backgroundRgba;
    player.style.color = foregroundRgb;
    player.style.fill = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-left")).style.borderColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-right")).style.borderColor = foregroundRgb;
    let fullContent: HTMLDivElement = el.querySelector(".penguin-player__player--full-content");
    foregroundRgb = `rgb(${findHighContrastColor([255, 255, 255], palette).join(", ")})`;
    fullContent.style.color = foregroundRgb;
    fullContent.style.fill = foregroundRgb;
    let highContrastToWhiteAlpha = `rgba(${findHighContrastColor([255, 255, 255], palette).join(", ")}, 0.5)`;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-bar")).style.backgroundColor = highContrastToWhiteAlpha;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner")).style.backgroundColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-dot")).style.backgroundColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-bar")).style.backgroundColor = highContrastToWhiteAlpha;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-inner")).style.backgroundColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-dot")).style.backgroundColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.color = highContrastToWhiteAlpha;
    dispatchEvent("penguinthemecolorchange", { color, palette });
}

export function rotateToggle(rotate: boolean) {
    let thumbnail = (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img"));
    if (rotate) {
        thumbnail.classList.add("rotate");
    } else {
        thumbnail.classList.remove("rotate");
    }
}

export function resetRotate() {
    let thumbnail = (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img"));
    thumbnail.style.animation = "none";
    setTimeout(() => {
        thumbnail.style.animation = "";
    });
}