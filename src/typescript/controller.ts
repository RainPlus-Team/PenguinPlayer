import { formatTime, print } from "./helper";
import { container as el } from "./player";
import { setSong as setMediaSession } from "./mediaSession";
import { getLyric } from "./lyric";
import { progressSlider, resetRotate, setThemeColor, volumeSlider } from "./ui";
import { dispatchEvent } from "./modules/event";
import ajax from "./modules/ajax";

export let songs: Song[] = [];
export let currentSong: number;

let errorAmount = 0, currentUrlReq: AjaxPromise;

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

window.addEventListener("penguininitialized", () => {
    audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    audio.addEventListener("playing", () => errorAmount = 0);
    audio.addEventListener("error", playFailedHandler);
});

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
        if (currentUrlReq) { currentUrlReq.cancel(); }
        currentUrlReq = ajax(`https://gcm.tenmahw.com/song/url?id=${song.id}`).send().then((result) => {
            if (result.data.code == 200) {
                let track = result.data.data[0];
                if (track.url == null) {
                    print(`${song.name} is unavailable`);
                    next();
                } else {
                    playTrack(track);
                }
            } else { playFailedHandler(); }
        }).catch(playFailedHandler);
        getLyric(song);
        dispatchEvent("penguinsongchange", { detail: song });
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