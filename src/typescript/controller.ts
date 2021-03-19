import { formatTime, print } from "./modules/helper";
import { container as el } from "./player";
import { setSong as setMediaSession } from "./modules/mediaSession";
import { getLyric } from "./lyric";
import { progressSlider, resetRotate, setThemeColor, volumeSlider } from "./ui";
import { addEventListener, dispatchEvent } from "./modules/event";
import ajax from "./modules/ajax";

import list from "../icons/list-play.svg";
import listLoop from "../icons/list-loop.svg";
import singleLoop from "../icons/single-loop.svg";
import random from "../icons/random.svg";

export let songs: Song[] = [];
export let currentSong: number;
export function mode(newMode?: "list" | "list-loop" | "single-loop" | "random"): "list" | "list-loop" | "single-loop" | "random" | undefined {
    if (newMode) {
        playmode = newMode;
        localStorage.setItem("penguinplayer_playmode", playmode);
        updatePlaymodeButton();
    } else {
        return playmode;
    }
}

let playmode: "list" | "list-loop" | "single-loop" | "random" = "list-loop", errorAmount = 0, currentUrlReq: AjaxPromise;

const playFailedHandler = () => {
    errorAmount++;
    print(`Cannot play song ${songs[currentSong].name}`);
    if (errorAmount >= 5) {
        print(`Failed ${errorAmount} times, stop trying`);
    } else {
        next();
    }
}

let audio: HTMLAudioElement;

addEventListener("setup", () => {
    audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    audio.addEventListener("playing", () => errorAmount = 0);
    audio.addEventListener("error", playFailedHandler);
    audio.addEventListener("ended", handleEnded);
    let playmodeEl = <HTMLDivElement>el.querySelector(".penguin-player__player--controls-playmode");
    playmodeEl.addEventListener("click", () => {
        switch (playmode) {
            case "list": mode("list-loop"); break;
            case "list-loop": mode("single-loop"); break;
            case "single-loop": mode("random"); break;
            case "random": mode("list"); break;
        }
    });
    if (localStorage.getItem("penguinplayer_playmode") !== null) {
        mode(<"list" | "list-loop" | "single-loop" | "random">localStorage.getItem("penguinplayer_playmode"));
    }
    updatePlaymodeButton();
});

function handleEnded() {
    switch (playmode) {
        case "list": currentSong == songs.length-1 ? "" : next(); break;
        case "list-loop": next(); break;
        case "single-loop": play(); break;
        case "random": play(Math.floor(songs.length * Math.random())); break;
    }
}

function updatePlaymodeButton() {
    let playmodeEl = <HTMLDivElement>el.querySelector(".penguin-player__player--controls-playmode");
    switch (playmode) {
        case "list": playmodeEl.innerHTML = list; playmodeEl.setAttribute("data-mode", "列表播放"); break;
        case "list-loop": playmodeEl.innerHTML = listLoop; playmodeEl.setAttribute("data-mode", "列表循环"); break;
        case "single-loop": playmodeEl.innerHTML = singleLoop; playmodeEl.setAttribute("data-mode", "单曲循环"); break;
        case "random": playmodeEl.innerHTML = random; playmodeEl.setAttribute("data-mode", "随机播放"); break;
    }
}

function playTrack(track: any) {
    progressSlider.maxValue = progressSlider.minValue = null;
    if (track.freeTrialInfo) {
        trialInfo = track.freeTrialInfo;
        progressSlider.minValue = trialInfo.start / Math.floor(songs[currentSong].duration);
        progressSlider.maxValue = trialInfo.end / songs[currentSong].duration;
    }
    audio.src = track.url.replace("http:", "https:");
    play();
}

function reset() {
    setThemeColor([255, 255, 255], [[0, 0, 0]]);
    resetRotate();
    trialInfo = null;
}

export let trialInfo: TrialInfo;

export function setVolume(volume: number) {
    volumeSlider.setValue(volume);
}

export function getCurrentTime(): number {
    return audio.currentTime + (trialInfo?.start || 0);
}

export function getRealDuration(): number {
    return (trialInfo?.end - trialInfo?.start) || songs[currentSong].duration;
}

export function play(id?: number) {
    if (typeof id == "number") {
        if (id < 0 || id >= songs.length) { throw "Invalid song index"; }
        audio.pause();
        let song = songs[currentSong = id];
        reset();
        setMediaSession(song);
        (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-duration")).textContent = formatTime(song.duration);
        currentUrlReq?.cancel();
        currentUrlReq = ajax(`https://gcm.tenmahw.com/song/url?id=${song.id}`).send().then((result: AjaxResponse) => {
            if (result.data.code == 200) {
                let track = result.data.data[0];
                if (track.url) {
                    playTrack(track);
                } else {
                    print(`${song.name} is unavailable`);
                    next();
                }
            } else { playFailedHandler(); }
        }).catch(playFailedHandler);
        getLyric(song);
        dispatchEvent("songchange", song);
    } else { audio.play(); }
}

export function pause() {
    audio.pause();
}

export function next() {
    play(currentSong >= songs.length - 1 ? 0 : currentSong + 1);
}

export function prev() {
    play(currentSong <= 0 ? songs.length - 1 : currentSong - 1);
}