import { container as el } from "../player";
import { play, pause, next, prev } from "../controller";

if ("mediaSession" in navigator) {
    (<any>navigator).mediaSession.setActionHandler("play", play);
    (<any>navigator).mediaSession.setActionHandler("pause", pause);
    (<any>navigator).mediaSession.setActionHandler("seekbackward", () => {
        let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
    (<any>navigator).mediaSession.setActionHandler("seekforward", () => {
        let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });
    (<any>navigator).mediaSession.setActionHandler("previoustrack", prev);
    (<any>navigator).mediaSession.setActionHandler("nexttrack", next);
}

export function setSong(song: Song) {
    (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img")).src = song.thumbnail + "?param=48y48";
    (<HTMLHeadingElement>el.querySelector(".penguin-player__player--name")).textContent = song.name;
    (<HTMLParagraphElement>el.querySelector(".penguin-player__player--artists")).textContent = song.artists;
    if ("mediaSession" in navigator) {
        (<any>navigator).mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artists,
            album: song.album,
            artwork: [
                { src: song.thumbnail + "?param=96y96", sizes: "96x96" },
                { src: song.thumbnail + "?param=128y128", sizes: "128x128" },
                { src: song.thumbnail + "?param=192y192", sizes: "192x192" },
                { src: song.thumbnail + "?param=256y256", sizes: "256x256" },
                { src: song.thumbnail + "?param=384y384", sizes: "384x384" },
                { src: song.thumbnail + "?param=512y512", sizes: "512x512" }
            ]
        });
    }
}