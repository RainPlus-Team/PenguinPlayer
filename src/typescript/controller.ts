import { print } from "./helper";
import { container as el } from "./player";
import { setSong as setMediaSession } from "./mediaSession";
import { getLyric } from "./lyric";
import { resetRotate } from "./ui";

import axios, { CancelTokenSource } from "axios";

export let songs: Array<Song> = [];
export let currentSong: number;

let errorAmount = 0, currentUrlToken: CancelTokenSource;

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

export function play(id?: number) {
    if (typeof id == "number") {
        if (id < 0 || id > songs.length - 1) {
            print("Invalid song index");
            throw "Invalid song index";
        }
        audio.pause();
        currentSong = id;
        let song = songs[currentSong];
        let player: HTMLDivElement = el.querySelector(".penguin-player__player");
        player.style.backgroundColor = "";
        player.style.color = "";
        (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img")).src = song.thumbnail + "?param=48y48";
        (<HTMLHeadingElement>el.querySelector(".penguin-player__player--name")).textContent = song.name;
        (<HTMLParagraphElement>el.querySelector(".penguin-player__player--artists")).textContent = song.artists;
        setMediaSession(song);
        if (currentUrlToken) { currentUrlToken.cancel("Song changed"); }
        currentUrlToken = axios.CancelToken.source();
        axios.get(`https://gcm.tenmahw.com/song/url?id=${song.id}`, { cancelToken: currentUrlToken.token }).then((result) => {
            if (result.data.code == 200) {
                let track = result.data.data[0];
                if (track.url == null) {
                    print(`${song.name} is unavailable`);
                    next();
                } else {
                    audio.src = track.url.replace("http:", "https:");
                    audio.play();
                }
            } else {
                playFailedHandler();
            }
        }).catch((err) => {
            if (!axios.isCancel(err)) {
                playFailedHandler();
            }
        });
        getLyric(song);
        resetRotate();
        window.dispatchEvent(new CustomEvent("penguinsongchange", { detail: song }));
    } else {
        audio.play();
    }
}

export function pause() {
    audio.pause();
}

export function next() {
    if (currentSong >= songs.length - 1) {
        play(0);
    } else {
        play(currentSong + 1);
    }
}

export function prev() {
    if (currentSong <= 0) {
        play(songs.length - 1);
    } else {
        play(currentSong - 1);
    }
}