import { findHighContrastColor } from "./color";
import { container as el } from "./player";

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