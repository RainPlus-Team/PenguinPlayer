import Scrollbar from "smooth-scrollbar";
import LazyLoad, { ILazyLoadInstance } from "vanilla-lazyload";

import { findHighestContrastColor } from "./modules/color";
import { addEventListener, addEventListeners, dispatchEvent } from "./modules/event";
import { api, colorthief, container as el } from "./player";
import Slider from "./modules/slider";
//import Marquee from "./modules/marquee";
import { getCurrentTime, next, play, Playmodes, prev, setPlaymode, trialInfo } from "./controller";
import { createSongElement } from "./modules/element-helper";
import { formatTime } from "./modules/helper";
/// #if IE_SUPPORT
import { isBlurSupported } from "./modules/helper";
/// #endif

import list from "../icons/list-play.svg";
import listLoop from "../icons/list-loop.svg";
import singleLoop from "../icons/single-loop.svg";
import random from "../icons/random.svg";

export let volumeSlider: Slider, progressSlider: Slider;
export let lazyLoad: ILazyLoadInstance;

let progressEl: HTMLElement,
    left: HTMLElement,
    right: HTMLElement;

addEventListener("setup", () => {
    progressEl = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress")),
    left = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-left")),
    right = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-right"));
})

export function setCircleProgress(progress: number) {
    if (progress <= 50) {
        progressEl.style.clip = "";
        left.style.transform = "rotate(0deg)";
        right.style.transform = `rotate(${progress / 50 * 180}deg)`;
    } else {
        progressEl.style.clip = "auto";
        left.style.transform = `rotate(${progress / 100 * 360}deg)`;
        right.style.transform = "rotate(180deg)";
    }
}
/// #if USE_COLORTHEIF
export function setThemeColor(color: Color, palette: Color[]) {
    let backgroundRgba = `rgba(${color.join(", ")}, 0.5)`;
    let foregroundRgb = `rgb(${findHighestContrastColor(color, palette).join(", ")})`;
    let player: HTMLDivElement = el.querySelector(".penguin-player__player");
    player.style.backgroundColor = backgroundRgba;
    player.style.color = player.style.fill = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-left")).style.borderColor = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-right")).style.borderColor = foregroundRgb;
    let fullContent: HTMLDivElement = el.querySelector(".penguin-player__player--full-content"),
        playlist: HTMLDivElement = el.querySelector(".penguin-player__player--playlist");
    foregroundRgb = `rgb(${findHighestContrastColor([255, 255, 255], palette).join(", ")})`;
    playlist.style.color = playlist.style.fill = fullContent.style.color = fullContent.style.fill = foregroundRgb;
    let highContrastToWhiteAlpha = `rgba(${findHighestContrastColor([255, 255, 255], palette).join(", ")}, 0.5)`;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-bar")).style.backgroundColor = (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-bar")).style.backgroundColor = (<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.color = highContrastToWhiteAlpha;
    el.querySelectorAll(".penguin-player__player--progress-inner, .penguin-player__player--progress-dot, .penguin-player__player--controls-volume-inner, .penguin-player__player--controls-volume-dot").forEach((el) => {
        (<HTMLDivElement>el).style.backgroundColor = foregroundRgb;
    });
    dispatchEvent("themecolorchange", color, findHighestContrastColor(color, palette), findHighestContrastColor([255, 255, 255], palette), findHighestContrastColor([0, 0, 0], palette), palette);
}
/// #endif
export function rotateToggle(rotate: boolean) {
    let thumbnail = (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img"));
    if (rotate && !(<any>api.song).noThumbnail)
        thumbnail.classList.add("rotate");
    else
        thumbnail.classList.remove("rotate");
}

export function resetRotate() {
    let thumbnail = (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img"));
    thumbnail.style.animation = "none";
    el.offsetHeight; // Animation reset hack
    thumbnail.style.animation = "";
}

export function handlePlaylist(list: Song[]) {
    let playlist: HTMLElement = el.querySelector(".penguin-player__player--playlist");
    playlist = playlist.querySelector(".scroll-content") || playlist;
    for (let i = 0;i<list.length;i++) { playlist.appendChild(createSongElement(list[i], () => {play(i);})); }
    lazyLoad = new LazyLoad({
        container: playlist,
        elements_selector: ".penguin-player--lazy",
        unobserve_entered: true
    });
}

function thumbState(state: boolean) { rotateToggle(state); (<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.opacity = state ? "1" : "0"; }

export function updatePlayPauseButton() {
    let [play, pause] = [
        (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-play")),
        (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-pause"))
    ];
    if ((<HTMLAudioElement>el.querySelector(".penguin-player__audio")).paused)
        [play.style.display, pause.style.display] = ["block", "none"];
    else
        [play.style.display, pause.style.display] = ["none", "block"];
}

export function updatePlaymodeButton() {
    let playmodeEl = <HTMLDivElement>el.querySelector(".penguin-player__player--controls-playmode");
    switch (setPlaymode()) {
        case Playmodes.List: playmodeEl.innerHTML = list; playmodeEl.setAttribute("data-mode", "列表播放"); break;
        case Playmodes.ListLoop: playmodeEl.innerHTML = listLoop; playmodeEl.setAttribute("data-mode", "列表循环"); break;
        case Playmodes.SingleLoop: playmodeEl.innerHTML = singleLoop; playmodeEl.setAttribute("data-mode", "单曲循环"); break;
        case Playmodes.Random: playmodeEl.innerHTML = random; playmodeEl.setAttribute("data-mode", "随机播放"); break;
    }
}

//export let songnameMarquee: Marquee;

addEventListener("setup", () => {
    let audio: HTMLAudioElement = el.querySelector(".penguin-player__audio");
    // Audio setup
    addEventListeners(audio, "play pause", updatePlayPauseButton);
    audio.addEventListener("playing", () => thumbState(true));
    audio.addEventListener("pause", () => thumbState(false));
    let bufferedBar = (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-buffered"));
    audio.addEventListener("progress", function() {
        if (this.buffered.length <= 0) return;
        bufferedBar.style.width = ((this.buffered.end(this.buffered.length - 1) + (trialInfo?.startTime || 0)) / api.duration * 100) + "%";
    });
    let [currentTime, progressBar] = [(<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-current")), (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner"))];
    audio.addEventListener("timeupdate", function() {
        setCircleProgress(getCurrentTime() / api.duration * 100);
        currentTime.textContent = formatTime(getCurrentTime());
        progressBar.style.width = (getCurrentTime() / api.duration * 100) + "%";
    });
    // Controls setup
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-previous")).addEventListener("click", prev);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-next")).addEventListener("click", next);
    // Toggles setup
    (<HTMLButtonElement>el.querySelector(".penguin-player__player--full-toggle")).addEventListener("click", function() {
        let player = (<HTMLDivElement>el.querySelector(".penguin-player__player"));
        if (player.classList.contains("penguin-player__player-full")) {
            player.classList.remove("penguin-player__player-playlist");
            player.classList.remove("penguin-player__player-full");
        } else
            player.classList.add("penguin-player__player-full");
    });
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-playlist")).addEventListener("click", () => {
        let player = (<HTMLDivElement>el.querySelector(".penguin-player__player"));
        if (player.classList.contains("penguin-player__player-playlist"))
            player.classList.remove("penguin-player__player-playlist");
        else
            player.classList.add("penguin-player__player-playlist");
    });
    // Thumbnail setup
    /// #if USE_COLORTHEIF
    (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img")).addEventListener("load", function() {
        ///#if IE_SUPPORT
        if (!isBlurSupported()) {
            setThemeColor([255, 255, 255], [[0, 0, 0]]);
            return;
        }
        ///#endif
        if ((<any>api.song).noThumbnail || api.song.thumbnailNoCrossOrigin)
            setThemeColor([255, 255, 255], [[0, 0, 0]])
        else
            setThemeColor(colorthief.getColor(this), colorthief.getPalette(this));
    });
    /// #endif
    (<HTMLButtonElement>el.querySelector(".penguin-player__player--thumbnail-play-pause")).addEventListener("click", () => {
        if (el.querySelector(".penguin-player__player").clientWidth == 56) return;
        let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
        if (audio.paused)
            audio.play().catch();
        else
            audio.pause();
    });
    // Song information setup
    //songnameMarquee = new Marquee(<HTMLElement>el.querySelector(".penguin-player__player--name"), 0, true);
    //songnameMarquee.autoMarqueeDelay = 3000;
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
    progressSlider.addEventHandler("enddrag", () =>
        playerOldState ? 0 : audio.play().catch()
    );
    progressSlider.addEventHandler("valuechange", (value: number) => {
        let songDura = api.duration;
        let fullTime = songDura * value;
        audio.currentTime = fullTime - (trialInfo?.startTime || 0);
        return value < trialInfo?.startTime / songDura || value > trialInfo?.endTime / songDura;
    });
    // Volume bar setup
    volumeSlider = new Slider({
        activeSelector: ".penguin-player__player--controls-volume",
        barSelector: ".penguin-player__player--controls-volume-bar",
        innerSelector: ".penguin-player__player--controls-volume-inner"
    });
    volumeSlider.addEventHandler("valuechange", (value: number) => {
        audio.volume = value;
        localStorage.setItem("penguinplayer_volume", value.toString());
    });
    // Lyric overlay setup
    window.addEventListener("mousemove", (e) => {
        if (e.pageY >= window.innerHeight - 60)
            el.querySelector(".penguin-player__lyric").classList.add("penguin-player__lyric-hover");
        else
            el.querySelector(".penguin-player__lyric").classList.remove("penguin-player__lyric-hover");
    });
    Scrollbar.init(el.querySelector(".penguin-player__player--playlist"), { damping: 0.15 });
    /// #if IE_SUPPORT
    // IE 11 Blur Fallback
    /*if (!isBlurSupported()) {
        let cel = document.createElement("canvas");
        cel.classList.add("penguin-player__player--canvas-background");
        el.querySelector(".penguin-player__player").appendChild(cel);
    }*/
    /// #endif
});

addEventListener("playtrack", () =>
    (<HTMLSpanElement>el.querySelector(".penguin-player__player--trial-icon")).style.display = trialInfo ? "inline-block" : "none"
);