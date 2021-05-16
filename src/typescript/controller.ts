import { formatTime, print } from "./modules/helper";
import { api, container as el, playerOptions } from "./player";
import { setSong as setMediaSession } from "./modules/mediaSession";
import { getLyric } from "./lyric";
import { progressSlider, resetRotate, setThemeColor, volumeSlider } from "./ui";
import { addEventListener, dispatchEvent } from "./modules/event";

import list from "../icons/list-play.svg";
import listLoop from "../icons/list-loop.svg";
import singleLoop from "../icons/single-loop.svg";
import random from "../icons/random.svg";
import { getProvider } from "./modules/provider";

export enum Playmodes {
    List,
    ListLoop,
    SingleLoop,
    Random
}

export let songs: Song[] = [];
export let currentSong: number;
export function setPlaymode(newMode?: Playmodes): Playmodes | undefined {
    if (newMode !== undefined) {
        playmode = newMode;
        localStorage.setItem("penguinplayer_playmode", playmode.toString());
        updatePlaymodeButton();
    } else {
        return playmode;
    }
}

let playmode: Playmodes = Playmodes.ListLoop, errorAmount = 0;

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
    audio = el.querySelector(".penguin-player__audio");
    audio.addEventListener("playing", () => errorAmount = 0);
    audio.addEventListener("error", playFailedHandler);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("durationchange", () => (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-duration")).textContent = formatTime(api.duration));
    let playmodeEl = <HTMLDivElement>el.querySelector(".penguin-player__player--controls-playmode");
    playmodeEl.addEventListener("click", () => {
        setPlaymode(Object.values(Playmodes).includes(playmode + 1) ? playmode + 1 : 0);
    });
    addEventListener("initialized", () => {
        if (Object.values(Playmodes).includes(playerOptions.overridePlaymode)) {
            setPlaymode(playerOptions.overridePlaymode);
        } else if (localStorage.getItem("penguinplayer_playmode") !== null && !isNaN(parseInt(localStorage.getItem("penguinplayer_playmode")))) {
            setPlaymode(parseInt(localStorage.getItem("penguinplayer_playmode")));
        }
        updatePlaymodeButton();
    });
});

function handleEnded() {
    switch (playmode) {
        case Playmodes.List: currentSong == songs.length - 1 ? "" : next(); break;
        case Playmodes.ListLoop: next(); break;
        case Playmodes.SingleLoop: play(); break;
        case Playmodes.Random: play(Math.floor(songs.length * Math.random())); break;
    }
}

function updatePlaymodeButton() {
    let playmodeEl = <HTMLDivElement>el.querySelector(".penguin-player__player--controls-playmode");
    switch (playmode) {
        case Playmodes.List: playmodeEl.innerHTML = list; playmodeEl.setAttribute("data-mode", "列表播放"); break;
        case Playmodes.ListLoop: playmodeEl.innerHTML = listLoop; playmodeEl.setAttribute("data-mode", "列表循环"); break;
        case Playmodes.SingleLoop: playmodeEl.innerHTML = singleLoop; playmodeEl.setAttribute("data-mode", "单曲循环"); break;
        case Playmodes.Random: playmodeEl.innerHTML = random; playmodeEl.setAttribute("data-mode", "随机播放"); break;
    }
}

function reset() {
    setThemeColor([255, 255, 255], [[0, 0, 0]]);
    resetRotate();
    trialInfo = progressSlider.maxValue = progressSlider.minValue = null;
}

export let trialInfo: TrialInfo;

export function setVolume(volume: number) {
    volumeSlider.setValue(volume);
}

export function getCurrentTime(): number {
    return audio.currentTime + (trialInfo?.start || 0);
}

export function getRealDuration(): number {
    return audio.duration;
}

export function play(id?: number) {
    if (typeof id == "number") {
        if (id < 0 || id >= songs.length) { throw "Invalid song index"; }
        audio.pause();
        let song = songs[currentSong = id];
        reset();
        setMediaSession(song);
        getLyric(song);
        getProvider(song.provider).getUrl(song).then((res) => {
            if (song != api.song) return;
            audio.src = res;
            play();
        }).catch(playFailedHandler);
        dispatchEvent("songchange", song);
    } else { audio.play().catch(); }
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