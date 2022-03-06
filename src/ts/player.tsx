import { h, render } from "preact";

import { getSongByIndex, getSongListLength, Playlist, SongList } from "./playlist";
import { findProvider } from "./provider";
import { themeConfig } from "./theme";
import { Playmode } from "./playmode";
import {PlaylistLoadEvent, PlaymodeChangeEvent, SongChangeEvent} from "./events";

export interface Song {
    name: string
    artists: string[]
}

export interface Module {
    initialize(player: Player)

    unload?()
}

export class Player extends EventTarget {
    private readonly audio: HTMLAudioElement
    private layout: new () => Theme
    private _currentSong: number
    private _playmode: Playmode;

    public readonly options: PenguinPlayerOptions
    public readonly root: HTMLElement
    public readonly songs: SongList[]

    get currentSong() {
        return getSongByIndex(this.songs, this._currentSong);
    }
    get currentSongIndex() {
        return this._currentSong
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

    get playmode() {
        return this._playmode;
    }
    set playmode(v) {
        const old = this._playmode;
        this._playmode = v;
        this._playmode.initialize(this);
        this.dispatchEvent(new PlaymodeChangeEvent(old, v));
    }

    constructor(parent: HTMLElement, options: PenguinPlayerOptions) {
        super();
        this.options = options;

        this.layout = this.options.theme || themeConfig.currentTheme;

        // Create player root element
        const player = document.createElement("div");
        player.classList.add("PenguinPlayer");

        (parent || document.body).append(player);
        this.root = player;

        // Get audio ready
        this.audio = new Audio();

        // All ready, get the UI working!
        render(<this.layout
            options={options}
            player={this}
            currentTime={0}
            duration={0}
            song={this.currentSong.song}
        />, player);
    }

    next(user: boolean = true) {
        this.playmode.handleNext(user);
    }

    previous(user: boolean = true) {
        this.playmode.handlePrevious(user);
    }

    async play(index?: number) {
        if (index != undefined) {
            if (index < 0 || index >= getSongListLength(this.songs)) throw new Error("Song index out of bound");

            // Find the song and its provider
            this._currentSong = index;
            const ret = getSongByIndex(this.songs, index);
            const song = ret.song, provider = ret.provider;
            const p = findProvider(provider);
            if (p == null) throw new Error("No such provider " + provider);

            // Get its URL and then play it
            const url = await p.fetchUrl(song);
            this.dispatchEvent(new SongChangeEvent(this.currentSong.song, this.currentSong.provider, this.currentSongIndex));
            if (this._currentSong == index) { // Make sure song doesn't change when fetching URL
                this.audio.src = url;
                return await this.play();
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
        const songlist = {
            provider: playlist.provider,
            songs: list
        };
        this.songs.push(songlist);
        this.dispatchEvent(new PlaylistLoadEvent(songlist));
        if (len == 0 && this.options.autoplay) {
            // This is the first playlist loaded, and we should play it automatically
            const index = this.options.song || Math.floor(this.songs.length * Math.random());
            this.play(index).then(_ => console.log("Auto play started!"));
        }
    }

    withModule(module: Module) {
        // TODO: Handle module loading
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