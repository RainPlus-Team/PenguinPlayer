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

import { print } from "./modules/helper";
import { songs, currentSong, play, pause, prev, next, setVolume } from "./controller";
import { handlePlaylist } from "./ui";

/// #if !NO_STYLE
import "../sass/player.sass";
/// #endif

import template from "../template.pug";
import { addEventListener, removeEventListener, dispatchEvent, dispatchWindowEvent } from "./modules/event";
import ajax from "./modules/ajax";
import { getPlaylist } from "./modules/netease";

let el = document.createElement("div");
el.className = "penguin-player";
el.innerHTML = template;

export const container = el;
export const colorthief = new ColorThief();

export let playerOptions: PenguinPlayerOptions;

// Setup
{
    // Audio element setup
    let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    audio.addEventListener("playing", updatePlayPauseButton);
    audio.addEventListener("pause", updatePlayPauseButton);
    audio.addEventListener("error", () => print("Cannot play " + songs[currentSong].name));
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
    if (typeof playerOptions.playlist === "string") {
        playerOptions.playlist = [
            {
                type: "netease",
                id: playerOptions.playlist
            }
        ]
    }
    let waitPromises: Promise<any>[] = [];
    for (let provider of playerOptions.playlist) {
        switch (provider.type) {
            case "file":
                for (let item of provider.files) {
                    let artists = item.artists.join(", ");
                    if (!item.thumbnail) {
                        item.thumbnail = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M13,10V12H11V17A2,2 0 0,1 9,19A2,2 0 0,1 7,17A2,2 0 0,1 9,15C9.4,15 9.7,15.1 10,15.3V10H13Z' /%3E%3C/svg%3E";
                    }
                    songs.push(<FileSong>{
                        ...item,
                        artists,
                    });
                }
            break;
            case "netease":
                waitPromises.push(getPlaylist(provider.id).then((list) => {songs.push.apply(songs, list);}).catch(() => {
                    print("Cannot fetch Netease playlist");
                }));
            break;
        }
    }
    Promise.allSettled(waitPromises).then((v) => {
        if (songs.length <= 0) {
            print("Cannot initialize, empty playlist");
            return;
        }
        print("Playlist processed");
        handlePlaylist(songs);
        document.body.appendChild(el);
        dispatchEvent("initialized");
        if (typeof playerOptions.autoplay === "undefined" || playerOptions.autoplay) {
            play(playerOptions.startIndex || Math.floor(Math.random() * songs.length));
        }
        print("Player ready");
    });
}

/*function initializeWithPlaylist(list: any) {
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
    play(playerOptions.startIndex || Math.floor(Math.random() * songs.length));
    print("Player ready");
}*/

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

export const api = {
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
        let song = songs[currentSong];
        return song.provider == "netease" ? (<NeteaseSong>song).duration : (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).duration;
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

window.PPlayer = api;

dispatchWindowEvent("penguinplayerapiready");

print("https://github.com/M4TEC/PenguinPlayer");
print("Player loaded");
if (typeof window.penguinplayer_id === "string") {
    print("Auto initializing...");
    initialize(window.penguinplayer_id);
}