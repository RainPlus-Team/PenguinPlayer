declare global {
    interface Window {
        PPlayer: PenguinPlayerAPI
        penguinplayer_id?: string
    }
}

/// #if IE_SUPPORT
import "./modules/polyfill";
/// #if !NO_STYLE
import "../sass/ie.sass";
/// #endif
/// #endif

import ColorThief from "colorthief";

import { print, formatTime } from "./modules/helper";
import { songs, currentSong, play, pause, prev, next, setVolume, getCurrentTime } from "./controller";
import { setCircleProgress, setThemeColor, rotateToggle, handlePlaylist } from "./ui";

/// #if !NO_STYLE
import "../sass/player.sass";
/// #endif

import template from "../template.pug";
import { addEventListener, removeEventListener, dispatchEvent, dispatchWindowEvent } from "./modules/event";
import ajax from "./modules/ajax";

let el = document.createElement("div");
el.className = "penguin-player";
el.innerHTML = template;

export const container = el;
export const colorthief = new ColorThief();

export let playerOptions: PenguinPlayerOptions;

// Setup
{
    const stateChange = (state: boolean) => {rotateToggle(state);(<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.opacity = state ? "1" : "0";}
    // Audio element setup
    let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    audio.addEventListener("playing", () => stateChange(true));
    audio.addEventListener("pause", () => stateChange(false));
    audio.addEventListener("playing", updatePlayPauseButton);
    audio.addEventListener("pause", updatePlayPauseButton);
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
    addEventListener("initialized", () => {
        // Volume setup
        setVolume(1);
        if (typeof playerOptions.overrideVolume === "number") {
            setVolume(playerOptions.overrideVolume);
        } else {
            try {
                if (localStorage.getItem("penguinplayer_volume") !== null) {
                    let volume = parseInt(localStorage.getItem("penguinplayer_volume"));
                    setVolume(volume);
                }
            } catch { print("Invalid volume storage"); }
        }
    });
    dispatchEvent("setup");
}

function initialize(options: string | PenguinPlayerOptions) {
    playerOptions = typeof options === "string" ? {
        playlist: options
    } : options;
    fetchPlaylist(playerOptions.playlist);
}

function initializeWithPlaylist(list: any) {
    print("Initializing...");
    if (document.querySelector(".penguin-player") != null) {
        print("Initialize cancelled! Already initialized");
        return;
    }
    print(`Using playlist ${list.name}`);
    for (let track of list.tracks) {
        let artists = "";
        for (let artist of track.ar) { artists += `, ${artist.name}`; }
        songs.push({ id: track.id, name: track.name, artists: artists.substring(2), album: track.al.name, thumbnail: track.al.picUrl.replace("http:", "https:"), duration: track.dt / 1000 });
    }
    print("Playlist processed");
    handlePlaylist(songs);
    document.body.appendChild(el);
    dispatchEvent("initialized");
    play(Math.floor(Math.random() * songs.length));
    print("Player ready");
}

function fetchPlaylist(id: string) {
    print("Fetching playlist...");
    ajax(`https://gcm.tenmahw.com/resolve/playlist?id=${id}`).send().then((result: AjaxResponse) => {
        if (result.data == null || result.data.code != 200) {
            print("Cannot fetch playlist");
            setTimeout(fetchPlaylist, 3000);
        } else {
            try {
                initializeWithPlaylist(result.data.playlist);
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

window.PPlayer = {
    initialize, play, pause, next, previous: prev,
    addEventListener,
    removeEventListener,
    get volume() {
        return (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).volume;
    },
    set volume(value) {
        setVolume(value);
    },
    get currentTime() {
        return (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).currentTime;
    },
    set currentTime(value) {
        (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).currentTime = value;
    },
    get duration() {
        return songs[currentSong].duration;
    },
    get paused() {
        return (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).paused;
    },
    get song() {
        return songs[currentSong];
    },
    get playlist() {
        return songs;
    }
}

dispatchWindowEvent("penguineventready");

print("https://github.com/M4TEC/PenguinPlayer");
print("Player loaded");
if (typeof window.penguinplayer_id === "string") {
    print("Auto initializing...");
    initialize(window.penguinplayer_id);
}