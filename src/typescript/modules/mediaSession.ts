import { container as el } from "../player";
import { play, pause, next, prev } from "../controller";
import { getThumbnail } from "./helper";
//import { songnameMarquee } from "../ui";

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
    (<HTMLHeadingElement>el.querySelector(".penguin-player__player--name")).textContent = song.name;
    //songnameMarquee.setText(song.name);
    //songnameMarquee.marqueeTime = song.name.length * 50;
    (<HTMLParagraphElement>el.querySelector(".penguin-player__player--artists")).textContent = song.artists;
    let img = (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img"));
    if (song.thumbnailNoCrossOrigin)
        img.removeAttribute("crossorigin");
    else
        img.setAttribute("crossorigin", "anonymous");
    img.src = getThumbnail(song.thumbnail, 48);
    if ("mediaSession" in navigator) {
        (<any>navigator).mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artists,
            album: song.album,
            artwork: song.thumbnail.indexOf("%size%") != -1 || (song.thumbnail.indexOf("%width%") != -1 && song.thumbnail.indexOf("%height%") != -1) ? [
                { src: getThumbnail(song.thumbnail, 96), sizes: "96x96" },
                { src: getThumbnail(song.thumbnail, 128), sizes: "128x128" },
                { src: getThumbnail(song.thumbnail, 192), sizes: "192x192" },
                { src: getThumbnail(song.thumbnail, 256), sizes: "256x256" },
                { src: getThumbnail(song.thumbnail, 384), sizes: "384x384" },
                { src: getThumbnail(song.thumbnail, 512), sizes: "512x512" }
            ] : [
                { src: song.thumbnail }
            ]
        });
    }
}