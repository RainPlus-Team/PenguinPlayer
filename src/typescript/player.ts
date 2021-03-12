/// #if IE_SUPPORT
import "./polyfill";
import "../sass/ie.sass";
/// #endif

import ColorThief from "colorthief";
import LazyLoad, { ILazyLoadInstance } from "vanilla-lazyload";

import { findHighContrastColor } from "./modules/color";
import { print, formatTime } from "./modules/helper";
import { songs, currentSong, play, pause, prev, next, setVolume, getCurrentTime } from "./controller";
import { setCircleProgress, setThemeColor, rotateToggle } from "./ui";

import "../sass/player.sass";

import template from "../template.pug";
import { dispatchEvent } from "./modules/event";
import ajax from "./modules/ajax";

let el = document.createElement("div");
el.className = "penguin-player";
el.innerHTML = template;

export const container = el;

const playlist = (<any>window).penguin_id || "2717890285";
const colorthief = new ColorThief();

// Setup
{
    const stateChange = (state: boolean) => {rotateToggle(state);(<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.opacity = state ? "1" : "0";}
    // Audio element setup
    let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    audio.addEventListener("playing", () => stateChange(true));
    audio.addEventListener("pause", () => stateChange(false));
    audio.addEventListener("playing", updatePlayPauseButton);
    audio.addEventListener("pause", updatePlayPauseButton);
    audio.addEventListener("ended", next);
    audio.addEventListener("timeupdate", function() {
        setCircleProgress(getCurrentTime() / songs[currentSong].duration * 100);
        (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-current")).textContent = formatTime(getCurrentTime());
        (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner")).style.width = (getCurrentTime() / songs[currentSong].duration * 100) + "%";
    });
    audio.addEventListener("error", () => {print("Cannot play " + songs[currentSong].name);next();});
    // Controls setup
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-previous")).addEventListener("click", prev);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-next")).addEventListener("click", next);
    // Others setup
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
    window.addEventListener("penguininitialized", () => {
        // Volume setup
        setVolume(1);
        try {
            if (localStorage.hasItem("penguinplayer_volume")) {
                let volume = parseInt(localStorage.getItem("penguinplayer_volume"));
                setVolume(volume);
            }
        } catch { print("Invalid volume storage"); }
    });
}

let lazyLoad: ILazyLoadInstance;

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
    let color = colorthief.getColor(el), palette = colorthief.getPalette(el);
    let song = <HTMLElement>el.parentNode;
    song.style.backgroundColor = `rgba(${color.join(", ")}, 0.6)`;
    song.style.color = `rgb(${findHighContrastColor(color, palette).join(", ")})`;
}

function initialize(list: any) { // TODO: Refactor initialize
    print(`Using playlist ${list.name}`);
    for (let track of list.tracks) {
        let artists = "";
        for (let artist of track.ar) { artists += `, ${artist.name}`; }
        songs.push({ id: track.id, name: track.name, artists: artists.substring(2), album: track.al.name, thumbnail: track.al.picUrl.replace("http:", "https:"), duration: track.dt / 1000 });
    }
    print("Playlist processed");
    let playlist: HTMLElement = el.querySelector(".penguin-player__player--playlist");
    for (let i = 0;i<songs.length;i++) { playlist.appendChild(createSongElement(songs[i], () => {play(i);})); }
    lazyLoad = new LazyLoad({
        container: playlist,
        elements_selector: ".penguin-player--lazy",
        callback_loaded: onPlaylistSongLoaded // TODO: Fix performance problem when lazy load is not working
    });
    document.body.appendChild(el);
    dispatchEvent("penguininitialized");
    play(Math.floor(Math.random() * songs.length));
    print("Player ready");
}

function fetchPlaylist() {
    ajax(`https://gcm.tenmahw.com/resolve/playlist?id=${playlist}`).send().then((result) => {
        if (result.data == null || result.data.code != 200) {
            print("Cannot fetch playlist");
            setTimeout(fetchPlaylist, 3000);
        } else {
            try {
                initialize(result.data.playlist);
            } catch(e) {console.error(e);}
        }
    }).catch(() => {
        print("Cannot fetch playlist");
        setTimeout(fetchPlaylist, 3000);
    });
}

function updatePlayPauseButton() {
    let [play, pause] = [
        (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-play")),
        (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-pause"))
    ];
    if ((<HTMLAudioElement>el.querySelector(".penguin-player__audio")).paused) {
        [play.style.display, pause.style.display] = ["block", "none"];
    } else {
        [play.style.display, pause.style.display] = ["none", "block"];
    }
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
    get playlist(): Song[] {
        return songs;
    }
}

print("https://github.com/M4TEC/PenguinPlayer");
print("Initializing...");
fetchPlaylist();