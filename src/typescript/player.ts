import ColorThief from "colorthief";
import axios, { CancelTokenSource } from 'axios';
import PerfectScrollbar from "perfect-scrollbar";
import LazyLoad, { ILazyLoadInstance } from "vanilla-lazyload";

import { findHighContrastColor } from "./color";
import { formatTime, getOffsetLeft } from "./helper";
import cookie from "./cookie";

import "perfect-scrollbar/css/perfect-scrollbar.css";
import "../sass/player.sass";

import template from "../template.pug";

let el = document.createElement("div");
el.className = "penguin-player";
el.innerHTML = template;

const playlist = (<any>window).penguin_id || "2717890285";
const colorthief = new ColorThief();

// Types
interface Song {
    id : number,
    name : string,
    artists : string,
    album : string,
    thumbnail : string
}

let songs : Array<Song> = [];
let cx: number;

// Progress bar handlers
let progressbarDragging = false, playerDragOldState: boolean;
const progressbarUpdater = () => {
    if (!progressbarDragging) {return;}
    let bar: HTMLElement = el.querySelector(".penguin-player__player--progress-bar"),
        audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    let left = Math.max(0, cx - getOffsetLeft(bar));
    let width = bar.clientWidth;
    let progress = Math.min(1, left / width);
    audio.currentTime = audio.duration * progress;
    requestAnimationFrame(progressbarUpdater);
}
const progressHandlers = {
    beginDrag(e: MouseEvent | TouchEvent) {
        if (progressbarDragging) {return;}
        let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
        progressbarDragging = true;
        el.querySelector(".penguin-player__player--progress-bar").classList.add("penguin-player__player--progress-bar-dragging");
        playerDragOldState = audio.paused;
        audio.pause();
        progressbarUpdater();
        e.preventDefault();
        return false;
    },
    endDrag() {
        if (!progressbarDragging) {return;}
        progressbarDragging = false;
        el.querySelector(".penguin-player__player--progress-bar").classList.remove("penguin-player__player--progress-bar-dragging");
        if (!playerDragOldState) {
            (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).play();
        }
    }
}

// Volume bar handlers
let volumebarDragging = false;
const volumebarUpdater = () => {
    if (!volumebarDragging) {return;}
    let bar: HTMLElement = el.querySelector(".penguin-player__player--controls-volume-bar");
    let left = Math.max(0, cx - getOffsetLeft(bar));
    let width = bar.clientWidth;
    let progress = Math.min(1, left / width);
    setVolume(progress);
    requestAnimationFrame(volumebarUpdater);
}
const volumeHandlers = {
    beginDrag(e: MouseEvent | TouchEvent) {
        if (volumebarDragging) {return;}
        volumebarDragging = true;
        el.querySelector(".penguin-player__player--controls-volume-bar").classList.add("penguin-player__player--controls-volume-bar-dragging");
        volumebarUpdater();
        e.preventDefault();
        return false;
    },
    endDrag() {
        volumebarDragging = false;
        el.querySelector(".penguin-player__player--controls-volume-bar").classList.remove("penguin-player__player--controls-volume-bar-dragging");
    }
}

// Setup
{
    (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img")).addEventListener("load", function() {
        setThemeColor(colorthief.getColor(this), colorthief.getPalette(this));
    });
    (<HTMLButtonElement>el.querySelector(".penguin-player__player--thumbnail-play-pause")).addEventListener("click", () => {
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
            perfectScrollbar.update();
        }
    });
    // Progress bar setup
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-bar")).addEventListener("mousedown", progressHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner")).addEventListener("mousedown", progressHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-dot")).addEventListener("mousedown", progressHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-bar")).addEventListener("touchstart", progressHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner")).addEventListener("touchstart", progressHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-dot")).addEventListener("touchstart", progressHandlers.beginDrag);
    window.addEventListener("mouseup", progressHandlers.endDrag);
    window.addEventListener("touchend", progressHandlers.endDrag);
    // Volume bar setup
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume")).addEventListener("mousedown", volumeHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-bar")).addEventListener("mousedown", volumeHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-inner")).addEventListener("mousedown", volumeHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-dot")).addEventListener("mousedown", volumeHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume")).addEventListener("touchstart", volumeHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-bar")).addEventListener("touchstart", volumeHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-inner")).addEventListener("touchstart", volumeHandlers.beginDrag);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-dot")).addEventListener("touchstart", volumeHandlers.beginDrag);
    window.addEventListener("mouseup", volumeHandlers.endDrag);
    window.addEventListener("touchend", volumeHandlers.endDrag);
    // Cursor position update
    window.addEventListener("mousemove", (e) => {
        cx = e.pageX;
    });
    window.addEventListener("touchmove", (e) => {
        cx = e.touches[0].pageX;
    });
    // Controls setup
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-previous")).addEventListener("click", prev);
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-next")).addEventListener("click", next);
    // Audio element setup
    let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    audio.addEventListener("playing", () => {rotateToggle(true);(<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.opacity = "1";requestAnimationFrame(lyricUpdater);});
    audio.addEventListener("pause", () => {rotateToggle(false);(<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.opacity = "0";});
    audio.addEventListener("playing", updatePlayPauseButton);
    audio.addEventListener("pause", updatePlayPauseButton);
    audio.addEventListener("ended", next);
    audio.addEventListener("durationchange", function() {
        (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-duration")).textContent = formatTime(this.duration);
    });
    audio.addEventListener("timeupdate", function() {
        setCircleProgress(this.currentTime / this.duration * 100);
        (<HTMLSpanElement>el.querySelector(".penguin-player__player--progress-current")).textContent = formatTime(this.currentTime);
        (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner")).style.width = (this.currentTime / this.duration * 100) + "%";
    });
    audio.addEventListener("error", () => {print("Cannot play " + songs[currentSong].name);next();})
    // Volume setup
    setVolume(1);
    try {
        if (cookie.hasItem("penguin_volume")) {
            let volume = parseInt(cookie.getItem("penguin_volume"));
            setVolume(volume);
        }
    } catch {
        print("Invalid volume cookie");
    }
    // Media Session Handler setup
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
}

let lazyLoad: ILazyLoadInstance, perfectScrollbar: PerfectScrollbar, lyric: Array<object>, tLrc: Array<object>;

function print(text: string) {
    console.log("%cPPlayer%c" + text,"border-top-left-radius:5px;border-bottom-left-radius:5px;padding:0 5px;font-size:24px;font-family:'Microsoft YaHei Light','Microsoft YaHei';background-color:darkred;color:white;","border-top-right-radius:5px;border-bottom-right-radius:5px;padding:5px;padding-top:10px;padding-bottom:2px;font-size:14px;font-family:'Microsoft YaHei Light','Microsoft YaHei';background-color:pink;color:darkred;margin:5px;margin-left:0;");
}

function initialize() {
    axios.get(`https://gcm.tenmahw.com/resolve/playlist?id=${playlist}`).then((result) => {
        if (result.data.code != 200) {
            print("Cannot fetch playlist");
            initialize();
        } else {
            try {
                let list = result.data.playlist;
                print(`Using playlist ${list.name}`);
                for (let track of list.tracks) {
                    let artists = "";
                    for (let artist of track.ar) {
                        artists += `, ${artist.name}`;
                    }
                    songs.push({
                        id: track.id,
                        name: track.name,
                        artists: artists.substring(2),
                        album: track.al.name,
                        thumbnail: track.al.picUrl.replace("http:", "https:")
                    });
                }
                print("Playlist processed");
                let playlist: HTMLElement = el.querySelector(".penguin-player__player--playlist");
                for (let i = 0;i<songs.length;i++) {
                    let song = songs[i];
                    let songEl = document.createElement("div");
                    songEl.classList.add("penguin-player__player--playlist-song");
                    songEl.addEventListener("click", () => {
                        play(i);
                    });
                    let img = document.createElement("img");
                    img.classList.add("penguin-player__player--playlist-thumbnail");
                    img.classList.add("penguin-player--lazy");
                    img.crossOrigin = "anonymous";
                    img.setAttribute("data-src", song.thumbnail + "?param=36y36");
                    songEl.appendChild(img);
                    let title = document.createElement("h1");
                    title.classList.add("penguin-player__player--playlist-title");
                    title.textContent = song.name;
                    songEl.appendChild(title);
                    let artists = document.createElement("p");
                    artists.classList.add("penguin-player__player--playlist-artists");
                    artists.textContent = song.artists;
                    songEl.appendChild(artists);
                    playlist.appendChild(songEl);
                }
                lazyLoad = new LazyLoad({
                    container: playlist,
                    elements_selector: ".penguin-player--lazy",
                    callback_loaded: (el) => {
                        let color = colorthief.getColor(el);
                        let palette = colorthief.getPalette(el);
                        let song = <HTMLElement>el.parentNode;
                        song.style.backgroundColor = `rgba(${color.join(", ")}, 0.6)`;
                        song.style.color = `rgb(${findHighContrastColor(color, palette).join(", ")})`;
                    }
                });
                perfectScrollbar = new PerfectScrollbar(playlist);
                document.body.appendChild(el);
                play(Math.floor(Math.random() * songs.length));
                print("Player ready");
                window.dispatchEvent(new Event("penguininitialized"));
            } catch(e) {console.error(e);}
        }
    }).catch((err) => {
        if (!axios.isCancel(err)) {
            print("Cannot fetch playlist");
            initialize();
        }
    });
}

function updatePlayPauseButton() {
    let play = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-play"));
    let pause = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-pause"))
    if ((<HTMLAudioElement>el.querySelector(".penguin-player__audio")).paused) {
        play.style.display = "block";
        pause.style.display = "none";
    } else {
        play.style.display = "none";
        pause.style.display = "block";
    }
}

let lrcStartPos = 0, tLrcStartPos = 0, lastLrc = "", lastSubLrc = "", lrcTimeout: any, subLrcTimeout: any;

function lyricUpdater() {
    let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
    if (audio.paused) {return};
    let mainLrc = "", subLrc = "";
    if (lyric != null) {
        for (let i = lrcStartPos;i < lyric.length;i++) {
            let line: any = lyric[i];
            if (i == lyric.length - 1 || (<any>lyric[i + 1]).time > audio.currentTime * 1000) {
                if (line.time < audio.currentTime * 1000) {
                    mainLrc = line.value;
                    if (tLrc == null && i != lyric.length - 1) {
                        subLrc = (<any>lyric[i + 1]).value;
                    }
                } else {
                    lrcStartPos = 0;
                    break;
                }
                lrcStartPos = i;
                break;
            }
        }
        if (tLrc != null && mainLrc == "") {
            for (let i = tLrcStartPos;i < tLrc.length;i++) {
                let line: any = tLrc[i];
                if (i == tLrc.length - 1 || (<any>tLrc[i + 1]).time > audio.currentTime * 1000) {
                    if (line.time < audio.currentTime * 1000) {
                        subLrc = line.value;
                    } else {
                        tLrcStartPos = 0;
                        break;
                    }
                    tLrcStartPos = 0;
                    break;
                }
            }
        }
    }
    if (mainLrc != lastLrc) {
        if (lrcTimeout) {clearTimeout(lrcTimeout);}
        let lrc = (<HTMLHeadingElement>el.querySelector(".penguin-player__lyric--main"));
        lrc.style.opacity = "0";
        lrcTimeout = setTimeout(() => {
            if (mainLrc == "") {
                lrc.innerHTML = "&nbsp;";
            } else {
                lrc.textContent = mainLrc;
            }
            lrc.style.opacity = "1";
        }, 100);
        lastLrc = mainLrc;
    }
    if (subLrc != lastSubLrc) {
        if (subLrcTimeout) {clearTimeout(subLrcTimeout);}
        let lrc = (<HTMLHeadingElement>el.querySelector(".penguin-player__lyric--sub"));
        lrc.style.opacity = "0";
        subLrcTimeout = setTimeout(() => {
            if (subLrc == "") {
                lrc.innerHTML = "&nbsp;";
            } else {
                lrc.textContent = subLrc;
            }
            lrc.style.opacity = "1";
        }, 100);
        lastSubLrc = subLrc;
    }
    requestAnimationFrame(lyricUpdater);
}

function setThemeColor(color, palette) {
    let backgroundRgba = `rgba(${color.join(", ")}, 0.5)`;
    let foregroundRgb = `rgb(${findHighContrastColor(color, palette).join(", ")})`;
    let player: HTMLDivElement = el.querySelector(".penguin-player__player");
    player.style.backgroundColor = backgroundRgba;
    player.style.color = foregroundRgb;
    player.style.fill = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-left")).style.borderColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-right")).style.borderColor = foregroundRgb;
    let fullContent: HTMLDivElement = el.querySelector(".penguin-player__player--full-content");
    foregroundRgb = `rgb(${findHighContrastColor([255, 255, 255], palette).join(", ")})`;
    fullContent.style.color = foregroundRgb;
    fullContent.style.fill = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-bar")).style.backgroundColor = `rgba(${findHighContrastColor([255, 255, 255], palette).join(", ")}, 0.5)`;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-inner")).style.backgroundColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--progress-dot")).style.backgroundColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-bar")).style.backgroundColor = `rgba(${findHighContrastColor([255, 255, 255], palette).join(", ")}, 0.5)`;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-inner")).style.backgroundColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-dot")).style.backgroundColor = foregroundRgb;
    (<HTMLDivElement>el.querySelector(".penguin-player__lyric")).style.color = `rgb(${findHighContrastColor([255, 255, 255], palette).join(", ")})`;
}

function rotateToggle(rotate: boolean) {
    let thumbnail = (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img"));
    if (rotate) {
        thumbnail.classList.add("rotate");
    } else {
        thumbnail.classList.remove("rotate");
    }
}

function resetRotate() {
    let thumbnail = (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img"));
    thumbnail.style.animation = "none";
    setTimeout(() => {
        thumbnail.style.animation = "";
    });
}

function setCircleProgress(progress: number) {
    let prog = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress"));
    let left = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-left"));
    let right = (<HTMLDivElement>el.querySelector(".penguin-player__player--thumbnail-progress-right"));
    if (progress <= 50) {
        prog.style.clip = "";
        left.style.transform = "rotate(0deg)";
        right.style.transform = `rotate(${progress / 50 * 180}deg)`;
    } else {
        prog.style.clip = "auto";
        left.style.transform = `rotate(${progress / 100 * 360}deg)`;
        right.style.transform = "rotate(180deg)";
    }
}

let currentSong: number = null, currentUrlToken: CancelTokenSource, currentLyricToken: CancelTokenSource, errorAmount = 0;

// Expose API

function play(id?: number) {
    if (typeof id == "number") {
        if (id < 0 || id > songs.length - 1) {
            print("Invalid song index");
            throw "Invalid song index";
        }
        (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).pause();
        currentSong = id;
        lrcStartPos = 0;
        tLrcStartPos = 0;
        lyric = undefined;
        tLrc = undefined;
        let song = songs[currentSong];
        let player: HTMLDivElement = el.querySelector(".penguin-player__player");
        player.style.backgroundColor = "";
        player.style.color = "";
        (<HTMLImageElement>el.querySelector(".penguin-player__player--thumbnail-img")).src = song.thumbnail + "?param=48y48";
        (<HTMLHeadingElement>el.querySelector(".penguin-player__player--name")).textContent = song.name;
        (<HTMLParagraphElement>el.querySelector(".penguin-player__player--artists")).textContent = song.artists;
        if ("mediaSession" in navigator) {
            (<any>navigator).mediaSession.metadata = new MediaMetadata({
                title: song.name,
                artist: song.artists,
                album: song.album,
                artwork: [
                    {
                        src: song.thumbnail + "?param=96y96",
                        sizes: "96x96"
                    },
                    {
                        src: song.thumbnail + "?param=128y128",
                        sizes: "128x128"
                    },
                    {
                        src: song.thumbnail + "?param=192y192",
                        sizes: "192x192"
                    },
                    {
                        src: song.thumbnail + "?param=256y256",
                        sizes: "256x256"
                    },
                    {
                        src: song.thumbnail + "?param=384y384",
                        sizes: "384x384"
                    },
                    {
                        src: song.thumbnail + "?param=512y512",
                        sizes: "512x512"
                    }
                ]
            });
        }
        if (currentUrlToken) {
            currentUrlToken.cancel("Song changed");
        }
        currentUrlToken = axios.CancelToken.source();
        const playFailedHandler = () => {
            errorAmount++;
            print(`Cannot play song ${song.name}`);
            if (errorAmount >= 5) {
                print(`Failed ${errorAmount} times, stop trying`);
            } else {
                next();
            }
        }
        axios.get(`https://gcm.tenmahw.com/song/url?id=${song.id}`, { cancelToken: currentUrlToken.token }).then((result) => {
            if (result.data.code == 200) {
                let track = result.data.data[0];
                if (track.url == null) {
                    print(`${song.name} is unavailable`);
                    next();
                } else {
                    let audio = (<HTMLAudioElement>el.querySelector(".penguin-player__audio"));
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
        if (currentLyricToken) {
            currentLyricToken.cancel("Song changed");
        }
        currentLyricToken = axios.CancelToken.source();
        axios.get(`https://gcm.tenmahw.com/resolve/lyric?id=${song.id}`, { cancelToken: currentLyricToken.token }).then((result) => {
            if (result.data.lyric) {
                lyric = result.data.lyric.lrc;
                tLrc = result.data.lyric.tlrc;
            } else {
                print(`No lyric for ${song.name}`);
            }
        }).catch((err) => {
            if (!axios.isCancel(err)) {
                print("Failed to fetch lyric");
            }
        });
        resetRotate();
        window.dispatchEvent(new CustomEvent("penguinsongchange", { detail: song }));
    } else {
        (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).play();
    }
}

function pause() {
    (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).pause();
}

function next() {
    if (currentSong >= songs.length - 1) {
        play(0);
    } else {
        play(currentSong + 1);
    }
}

function prev() {
    if (currentSong <= 0) {
        play(songs.length - 1);
    } else {
        play(currentSong - 1);
    }
}

function setVolume(volume: number) {
    (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).volume = volume;
    (<HTMLDivElement>el.querySelector(".penguin-player__player--controls-volume-inner")).style.width = `${volume * 100}%`;
    cookie.setItem("penguin_volume", volume, Infinity);
}

(<any>window).PPlayer = {
    play,
    pause,
    next,
    previous: prev,
    get volume(): number {
        return (<HTMLAudioElement>el.querySelector(".penguin-player__audio")).volume;
    },
    set volume(value) {
        setVolume(value);
    },
    get song(): Song {
        return songs[currentSong];
    },
    get playlist(): Array<Song> {
        return songs;
    }
}

print("https://github.com/M4TEC/PenguinPlayer");
print("Initializing...");
initialize();