declare global {
    interface Window {
        PPlayer: PenguinPlayerAPI
        penguinplayer_id?: string
    }
}

/// #if !NO_STYLE
import "../sass/player.sass";
/// #endif

/// #if IE_SUPPORT
import "./modules/polyfill";
/// #if !NO_STYLE
import "../sass/ie.sass";
/// #endif
/// #endif

import ColorThief from "colorthief";

import { print } from "./modules/helper";
import { songs, currentSong, play, pause, prev, next, setVolume, setPlaymode } from "./controller";
import { handlePlaylist } from "./ui";

import template from "../template.pug";
import { addEventListener, removeEventListener, dispatchEvent, dispatchWindowEvent } from "./modules/event";
import { getProvider } from "./modules/provider";

let el = document.createElement("div");
el.className = "penguin-player";
el.innerHTML = template;

export const container = el;
export const colorthief = new ColorThief();

export let playerOptions: PenguinPlayerOptions;

// Setup
{
    addEventListener("initialized", () => {
        // Volume setup
        if (typeof playerOptions.overrideVolume === "number")
            setVolume(playerOptions.overrideVolume);
        else
            try {
                if (localStorage.getItem("penguinplayer_volume") !== null) {
                    let volume = parseFloat(localStorage.getItem("penguinplayer_volume"));
                    setVolume(volume);
                }
            } catch { print("Invalid volume storage"); setVolume(1); }
    });
    dispatchEvent("setup");
}

function initialize(options: string | PenguinPlayerOptions) {
    playerOptions = typeof options === "string" ? {
        playlist: options
    } : options;
    if (typeof playerOptions.playlist === "string")
        playerOptions.playlist = [
            {
                type: "netease",
                options: playerOptions.playlist
            }
        ]
    // Disable autoplay if using slow network or cellular network
    let connectionInfo = ((<any>navigator).connection || (<any>navigator).mozConnection || (<any>navigator).webkitConnection);
    if (typeof playerOptions.autoplay !== "boolean" && connectionInfo)
        playerOptions.autoplay = connectionInfo.effectiveType !== "slow-2g" && (!connectionInfo.type || connectionInfo.type !== "cellular");
    let waitPromises: Promise<Song[]>[] = [];
    for (let playlist of playerOptions.playlist)
        waitPromises.push(getProvider(playlist.type).getPlaylist(playlist.options));
    Promise.allSettled(waitPromises).then((res) => {
        for (let result of res)
            if (result.status == "fulfilled")
                songs.push.apply(songs, result.value);
        if (songs.length <= 0) {
            print("Cannot initialize, empty playlist");
            return;
        }
        print("Playlist processed");
        handlePlaylist(songs);
        document.body.appendChild(el);
        dispatchEvent("initialized");
        if (typeof playerOptions.autoplay === "undefined" || playerOptions.autoplay)
            play(playerOptions.startIndex || Math.floor(Math.random() * songs.length));
        print("Player ready");
    });
}

export const api = {
    initialize, play, pause, next, previous: prev, setPlaymode,
    addEventListener, removeEventListener,
    get volume() { return (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).volume },
    set volume(value) { setVolume(value) },
    get currentTime() { return (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).currentTime },
    set currentTime(value) { (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).currentTime = value },
    get duration() {
        let song = songs[currentSong];
        return song.provider == "netease" ? (<NeteaseSong>song).duration : (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).duration;
    },
    get paused() { return (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).paused },
    get song() { return songs[currentSong] },
    get playlist() { return songs }
}

window.PPlayer = api;
dispatchWindowEvent("penguinplayerapiready");

print("https://github.com/M4TEC/PenguinPlayer");
print("Player loaded");
if (typeof window.penguinplayer_id === "string") {
    print("Auto initializing...");
    initialize(window.penguinplayer_id);
}