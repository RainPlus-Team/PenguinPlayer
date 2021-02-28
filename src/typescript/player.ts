import ColorThief from "colorthief";
import axios from 'axios';
import PerfectScrollbar from "perfect-scrollbar";
import LazyLoad, { ILazyLoadInstance } from "vanilla-lazyload";

import { findHighContrastColor } from "./color";
import { print, formatTime } from "./helper";
import { songs, currentSong, play, pause, prev, next } from "./controller";
import { setCircleProgress, setThemeColor, rotateToggle } from "./ui";
import cookie from "./cookie";
import Slider from "./slider";

import "perfect-scrollbar/css/perfect-scrollbar.css";
import "../sass/player.sass";

import template from "../template.pug";

let el = document.createElement("div");
el.className = "penguin-player";
el.innerHTML = template;

export const container = el;

const playlist = (<any>window).penguin_id || "2717890285";
const colorthief = new ColorThief();

let volumeSlider: Slider;

// Setup
{
    // Audio element setup
    let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    audio.addEventListener("playing", () => {rotateToggle(true);(<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.opacity = "1";});
    audio.addEventListener("pause", () => {rotateToggle(false);(<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.opacity = "0";});
    audio.addEventListener("playing", updatePlayPauseButton);
    audio.addEventListener("pause", updatePlayPauseButton);
    audio.addEventListener("ended", next);
    audio.addEventListener("durationchange", function() {
        (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-duration")).textContent = formatTime(this.duration);
    });
    audio.addEventListener("timeupdate", function() {
        setCircleProgress(this.currentTime / this.duration * 100);
        (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-current")).textContent = formatTime(this.currentTime);
        (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner")).style.width = (this.currentTime / this.duration * 100) + "%";
    });
    audio.addEventListener("error", () => {print("Cannot play " + songs[currentSong].name);next();});
    // Progress bar setup
    let playerOldState: boolean;
    let slider = new Slider({
        activeSelector: ".penguin-player__player--progress",
        barSelector: ".penguin-player__player--progress-bar",
        innerSelector: ".penguin-player__player--progress-inner",
        value: 0
    });
    slider.addEventHandler("begindrag", () => {
        playerOldState = audio.paused;
        audio.pause();
    });
    slider.addEventHandler("enddrag", () => {
        if (!playerOldState) {audio.play();}
    });
    slider.addEventHandler("valuechange", (value: number) => {
        audio.currentTime = audio.duration * value;
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
    // Controls setup
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-previous")).addEventListener("click", prev);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-next")).addEventListener("click", next);
    // Others setup
    (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img")).addEventListener("load", function() {
        setThemeColor(colorthief.getColor(this), colorthief.getPalette(this));
    });
    (<HTMLButtonElement>el.querySelector(".penguin-player__player--thumbnail-play-pause")).addEventListener("click", () => {
        let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });
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
            perfectScrollbar.update();
        }
    });
    // Volume setup
    setVolume(1);
    try {
        if (cookie.hasItem("penguin_volume")) {
            let volume = parseInt(cookie.getItem("penguin_volume"));
            setVolume(volume);
        }
    } catch {
        print("Invalid volume cookie");
    }
}

let lazyLoad: ILazyLoadInstance, perfectScrollbar: PerfectScrollbar;

function createSongElement(song: Song, click: () => void): HTMLElement {
    let songEl = document.createElement("div");
    songEl.classList.add("penguin-player__player--playlist-song");
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

function initialize() {
    axios.get(`https://gcm.tenmahw.com/resolve/playlist?id=${playlist}`).then((result) => {
        if (result.data.code != 200) {
            print("Cannot fetch playlist");
            setTimeout(initialize, 3000);
        } else {
            try {
                let list = result.data.playlist;
                print(`Using playlist ${list.name}`);
                for (let track of list.tracks) {
                    let artists = "";
                    for (let artist of track.ar) {
                        artists += `, ${artist.name}`;
                    }
                    songs.push({
                        id: track.id,
                        name: track.name,
                        artists: artists.substring(2),
                        album: track.al.name,
                        thumbnail: track.al.picUrl.replace("http:", "https:")
                    });
                }
                print("Playlist processed");
                let playlist: HTMLElement = el.querySelector(".penguin-player__player--playlist");
                for (let i = 0;i<songs.length;i++) {
                    let songEl = createSongElement(songs[i], () => {play(i);})
                    playlist.appendChild(songEl);
                }
                lazyLoad = new LazyLoad({
                    container: playlist,
                    elements_selector: ".penguin-player--lazy",
                    callback_loaded: (el) => {
                        let color = colorthief.getColor(el);
                        let palette = colorthief.getPalette(el);
                        let song = <HTMLElement>el.parentNode;
                        song.style.backgroundColor = `rgba(${color.join(", ")}, 0.6)`;
                        song.style.color = `rgb(${findHighContrastColor(color, palette).join(", ")})`;
                    }
                });
                perfectScrollbar = new PerfectScrollbar(playlist);
                document.body.appendChild(el);
                window.dispatchEvent(new Event("penguininitialized"));
                play(Math.floor(Math.random() * songs.length));
                print("Player ready");
            } catch(e) {console.error(e);}
        }
    }).catch((err) => {
        if (!axios.isCancel(err)) {
            print("Cannot fetch playlist");
            setTimeout(initialize, 3000);
        }
    });
}

function updatePlayPauseButton() {
    let play = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-play"));
    let pause = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-pause"))
    if ((<HTMLAudioElement>el.querySelector(".penguin-player__audio")).paused) {
        play.style.display = "block";
        pause.style.display = "none";
    } else {
        play.style.display = "none";
        pause.style.display = "block";
    }
}

export function setVolume(volume: number) {
    volumeSlider.setValue(volume);
}

(<any>window).PPlayer = {
    play, pause, next, previous: prev,
    get volume(): number {
        return (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).volume;
    },
    set volume(value) {
        setVolume(value);
    },
    get song(): Song {
        return songs[currentSong];
    },
    get playlist(): Array<Song> {
        return songs;
    }
}

print("https://github.com/M4TEC/PenguinPlayer");
print("Initializing...");
initialize();