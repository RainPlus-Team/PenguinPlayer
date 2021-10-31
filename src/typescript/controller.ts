import { formatTime, print } from "./modules/helper";
import { api, container as el, playerOptions } from "./player";
import { setSong as setMediaSession } from "./modules/mediaSession";
import { getLyric } from "./lyric";
import { progressSlider, resetRotate, updatePlaymodeButton, volumeSlider } from "./ui";
import { addEventListener, dispatchEvent } from "./modules/event";
/// #if USE_COLORTHEIF
import { setThemeColor } from "./ui";
/// #endif

import { getProvider } from "./modules/provider";
import CancelablePromise from "./modules/cancelable-promise";

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
    } else return playmode;
}

let playmode: Playmodes = Playmodes.ListLoop, errorAmount = 0;

const playFailedHandler = () => {
    errorAmount++;
    print(`Cannot play song ${api.song.name}`);
    if (errorAmount >= 5)
        print(`Failed ${errorAmount} times, stop trying`);
    else
        next();
}

let audio: HTMLAudioElement;

addEventListener("setup", () => {
    audio = el.querySelector(".penguin-player__audio");
    audio.addEventListener("playing", () => errorAmount = 0);
    audio.addEventListener("error", playFailedHandler);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("durationchange", () => (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-duration")).textContent = formatTime(api.duration));
    let playmodeEl = <HTMLDivElement>el.querySelector(".penguin-player__player--controls-playmode");
    playmodeEl.addEventListener("click", () => 
        setPlaymode(Object.values(Playmodes).includes(playmode + 1) ? playmode + 1 : 0)
    );
    addEventListener("initialized", () => {
        if (Object.values(Playmodes).includes(playerOptions.overridePlaymode))
            setPlaymode(playerOptions.overridePlaymode);
        else if (localStorage.getItem("penguinplayer_playmode") !== null && !isNaN(parseInt(localStorage.getItem("penguinplayer_playmode"))))
            setPlaymode(parseInt(localStorage.getItem("penguinplayer_playmode")));
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

function reset() {
    /// #if USE_COLORTHEIF
    setThemeColor([255, 255, 255], [[0, 0, 0]]);
    /// #endif
    resetRotate();
    trialInfo = progressSlider.maxValue = progressSlider.minValue = null;
}

let lastUrlPromise: CancelablePromise<void> | Promise<void>;

export let trialInfo: TrialInfo;

export function updateTrialInfo(info: TrialInfo) {
    trialInfo = info;
}

export function setVolume(volume: number) {
    volumeSlider.setValue(volume);
}

export function getCurrentTime(): number {
    return audio.currentTime + (trialInfo?.startTime || 0);
}

export function getRealDuration(): number {
    return audio.duration;
}

export function play(id?: number) {
    if (typeof id == "number") {
        if (id < 0 || id >= songs.length) throw "Invalid song index";
        if (lastUrlPromise instanceof CancelablePromise) lastUrlPromise.cancel();
        audio.pause();
        let song = songs[currentSong = id];
        reset();
        setMediaSession(song);
        getLyric(song);
        lastUrlPromise = getProvider(song.provider).getUrl(song).then((res) => {
            if (song != api.song) return;
            audio.src = res;
            play();
        }).catch(playFailedHandler);
        dispatchEvent("songchange", song);
    } else {
        let ret = audio.play();
        if (ret instanceof Promise) ret.catch();
    }
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