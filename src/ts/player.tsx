import { h, render } from "preact";

import { getSongByIndex, getSongListLength, Playlist, SongList } from "./playlist";
import { findProvider } from "./provider";
import { themeConfig } from "./theme";

export interface Song {
    name: string
    artists: string[]
}

export class Player {
    private readonly audio: HTMLAudioElement
    private layout: new () => Theme
    private _currentSong: number

    public readonly options: PenguinPlayerOptions
    public readonly root: HTMLElement
    public readonly songs: SongList[]

    get currentSong() {
        return this._currentSong;
    }

    get currentTime() {
        return this.audio ? this.audio.currentTime : NaN;
    }
    set currentTime(v) {
        this.audio ? this.audio.currentTime = v : "";
    }

    get volume() {
        return this.audio ? this.audio.volume : NaN;
    }
    set volume(v) {
        this.audio ? this.audio.volume = v : "";
    }

    get duration() {
        return this.audio ? this.audio.duration : NaN;
    }

    constructor(parent: HTMLElement, options: PenguinPlayerOptions) {
        this.options = options;

        this.layout = this.options.theme || themeConfig.currentTheme;

        const player = document.createElement("div");
        player.classList.add("PenguinPlayer");

        (parent || document.body).append(player);
        this.root = player;

        this.audio = new Audio();

        render(<this.layout ref={layout => {this.layout = layout;}} options={options} player={this} />, player);
    }

    next() {
        
    }

    previous() {

    }

    async play(index?: number) {
        if (index != undefined) {
            if (index < 0 || index >= getSongListLength(this.songs)) throw new Error("Song index out of bound");
            this._currentSong = index;
            const ret = getSongByIndex(this.songs, index);
            const song = ret.song, provider = ret.provider;
            const p = findProvider(provider);
            if (p == null) throw new Error("No such provider " + provider);
            const url = await p.fetchUrl(song);
            if (this._currentSong == index) { // Make sure song doesn't change when fetching URL
                this.audio.src = url;
                this.play();
            }
        } else
            return this.audio ? this.audio.play() : ""
    }

    pause() {
        this.audio ? this.audio.pause() : ""
    }

    async loadPlaylist(playlist: Playlist) {
        const provider = findProvider(playlist.provider);
        if (provider == null) throw new Error("No such provider " + playlist.provider);
        const list = await provider.fetchPlaylist(playlist);
        const len = this.songs.length;
        this.songs.push({
            provider: playlist.provider,
            songs: list
        });
        if (len == 0) {
            Math.floor(this.songs.length * Math.random())
        }
    }
}

export function initialize(options?: PenguinPlayerOptions): Player {
    const opt = {
        autoplay: true,
        ...options
    }

    if (opt.fixed && document.querySelector(".PPlayer--fixed"))
        throw Error("Only one instance of fixed player can be existed at once.");

    const instance = new Player(opt.parent, opt);
    if (opt.fixed)
        instance.root.classList.add("PPlayer--fixed");

    return instance;
}