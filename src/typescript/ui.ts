import Scrollbar from "smooth-scrollbar";
import LazyLoad, { ILazyLoadInstance } from "vanilla-lazyload";
/// #if IE_SUPPORT
const StackBlur = require('stackblur-canvas');
/// #endif

import { findHighContrastColor } from "./modules/color";
import { addEventListener, dispatchEvent } from "./modules/event";
import { colorthief, container as el } from "./player";
import Slider from "./modules/slider";
import { currentSong, getCurrentTime, next, play, prev, songs, trialInfo } from "./controller";
import { formatTime } from "./modules/helper";
/// #if IE_SUPPORT
import { isBlurSupported } from "./modules/helper";
import { schedule } from "./modules/task";
/// #endif

export let volumeSlider: Slider, progressSlider: Slider;
export let lazyLoad: ILazyLoadInstance;

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

export function setThemeColor(color: Color, palette: Color[]) {
    let backgroundRgba = `rgba(${color.join(", ")}, 0.5)`;
    /// #if IE_SUPPORT
    if (!isBlurSupported()) {
        let img = new Image(window.innerWidth / 4, window.innerHeight / 2);
        img.crossOrigin = "anonymous";
        img.src = songs[currentSong].thumbnail + `?param=${img.width}y${img.height}`;
        img.addEventListener("load", () => StackBlur.image(img, el.querySelector(".penguin-player__player--canvas-background"), 30));
    }
    /// #endif
    let foregroundRgb = `rgb(${findHighContrastColor(color, palette).join(", ")})`;
    let player: HTMLDivElement = el.querySelector(".penguin-player__player");
    player.style.backgroundColor = backgroundRgba;
    player.style.color = player.style.fill = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-left")).style.borderColor = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-right")).style.borderColor = foregroundRgb;
    let fullContent: HTMLDivElement = el.querySelector(".penguin-player__player--full-content");
    foregroundRgb = `rgb(${findHighContrastColor([255, 255, 255], palette).join(", ")})`;
    fullContent.style.color = fullContent.style.fill = foregroundRgb;
    let highContrastToWhiteAlpha = `rgba(${findHighContrastColor([255, 255, 255], palette).join(", ")}, 0.5)`;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-bar")).style.backgroundColor = (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-bar")).style.backgroundColor = (<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.color = highContrastToWhiteAlpha;
    el.querySelectorAll(".penguin-player__player--progress-inner, .penguin-player__player--progress-dot, .penguin-player__player--controls-volume-inner, .penguin-player__player--controls-volume-dot").forEach((el) => {
        (<HTMLDivElement>el).style.backgroundColor = foregroundRgb;
    });
    dispatchEvent("themecolorchange", color, findHighContrastColor(color, palette), findHighContrastColor([255, 255, 255], palette), findHighContrastColor([0, 0, 0], palette), palette);
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

export function handlePlaylist(list: Song[]) {
    let playlist: HTMLElement = el.querySelector(".penguin-player__player--playlist");
    playlist = playlist.querySelector(".scroll-content") || playlist;
    for (let i = 0;i<list.length;i++) { playlist.appendChild(createSongElement(list[i], () => {play(i);})); }
    lazyLoad = new LazyLoad({
        container: playlist,
        elements_selector: ".penguin-player--lazy",
        unobserve_entered: true,
        callback_loaded: onPlaylistSongLoaded
    });
}

function createSongElement(song: Song, click: () => void): HTMLElement {
    let songEl = document.createElement("div");
    songEl.classList.add("penguin-player__player--playlist-song");
    songEl.setAttribute("role", "listitem");
    songEl.addEventListener("click", click);
    let img = document.createElement("img");
    img.classList.add("penguin-player__player--playlist-thumbnail");
    img.classList.add("penguin-player--lazy");
    img.crossOrigin = "anonymous";
    img.setAttribute("data-src", song.thumbnail + "?param=36y36");
    songEl.appendChild(img);
    let title = document.createElement("h1");
    title.classList.add("penguin-player__player--playlist-title");
    title.textContent = song.name;
    songEl.appendChild(title);
    let artists = document.createElement("p");
    artists.classList.add("penguin-player__player--playlist-artists");
    artists.textContent = song.artists;
    songEl.appendChild(artists);
    return songEl;
}

function onPlaylistSongLoaded(el: HTMLElement) {
    /// #if IE_SUPPORT
    ((<any>window.document).documentMode ? schedule : (func: Function) => func())(() => {
    /// #endif
        try {
            let color = colorthief.getColor(el), palette = colorthief.getPalette(el);
            let song = <HTMLElement>el.parentNode;
            song.style.backgroundColor = `rgba(${color.join(", ")}, 0.6)`;
            song.style.color = `rgb(${findHighContrastColor(color, palette).join(", ")})`;
        } catch {}
    /// #if IE_SUPPORT
    });
    /// #endif
}

function thumbState(state: boolean) {rotateToggle(state);(<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.opacity = state ? "1" : "0";}

addEventListener("setup", () => {
    let audio: HTMLAudioElement = el.querySelector(".penguin-player__audio");
    // Audio setup
    audio.addEventListener("playing", () => thumbState(true));
    audio.addEventListener("pause", () => thumbState(false));
    audio.addEventListener("timeupdate", function() {
        setCircleProgress(getCurrentTime() / songs[currentSong].duration * 100);
        (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-current")).textContent = formatTime(getCurrentTime());
        (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner")).style.width = (getCurrentTime() / songs[currentSong].duration * 100) + "%";
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
        } else {
            player.classList.add("penguin-player__player-full");
        }
    });
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-playlist")).addEventListener("click", () => {
        let player = (<HTMLDivElement>el.querySelector(".penguin-player__player"));
        if (player.classList.contains("penguin-player__player-playlist")) {
            player.classList.remove("penguin-player__player-playlist");
        } else {
            player.classList.add("penguin-player__player-playlist");
        }
    });
    // Thumbnail setup
    (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img")).addEventListener("load", function() {
        setThemeColor(colorthief.getColor(this), colorthief.getPalette(this));
    });
    (<HTMLButtonElement>el.querySelector(".penguin-player__player--thumbnail-play-pause")).addEventListener("click", (e: MouseEvent) => {
        if (el.querySelector(".penguin-player__player").clientWidth == 56) {return;}
        let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });
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
        let songDura = songs[currentSong].duration;
        let fullTime = songDura * value;
        audio.currentTime = fullTime - (trialInfo?.start || 0);
        return value < trialInfo?.start / songDura || value > trialInfo?.end / songDura;
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
        if (e.pageY >= window.innerHeight - 60) {
            el.querySelector(".penguin-player__lyric").classList.add("penguin-player__lyric-hover");
        } else {
            el.querySelector(".penguin-player__lyric").classList.remove("penguin-player__lyric-hover");
        }
    });
    Scrollbar.init(el.querySelector(".penguin-player__player--playlist"), { damping: 0.15 });
    /// #if IE_SUPPORT
    // IE 11 Blur Fallback
    if (!isBlurSupported()) {
        let cel = document.createElement("canvas");
        cel.classList.add("penguin-player__player--canvas-background");
        el.querySelector(".penguin-player__player").appendChild(cel);
    }
    /// #endif
});

addEventListener("playtrack", () => {
    (<HTMLSpanElement>el.querySelector(".penguin-player__player--trial-icon")).style.display = trialInfo ? "inline-block" : "none";
});