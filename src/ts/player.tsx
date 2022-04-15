import { h, render } from "preact";

import { getSongByIndex, getSongListLength, Playlist, SongList } from "./playlist";
import { findProvider } from "./provider";
import { themeConfig } from "./theme";
import { Playmode } from "./playmode";
import { PlaylistLoadEvent, PlaymodeChangeEvent, SongChangeEvent } from "./events";

/**
 * Interface for classes that represent a song.
 */
export interface Song {
    thumbnail?: string
    name: string
    artists: string[]
    album?: string
}

/**
 * Interface for classes that represent a module.
 */
export interface Module {
    /**
     * Initializes a module.
     * @param player - The instance of the player.
     */
    initialize(player: Player)

    /**
     * Called when a module is being unloaded.
     */
    unload?()
}

/**
 * Penguin Player class.
 */
export class Player extends EventTarget {
    private layout: new () => Theme;
    private _currentSong: number;
    private _playmode: Playmode;
    private _modules: Module[];

    public readonly audio: HTMLAudioElement;

    public readonly options: PenguinPlayerOptions;
    public readonly root: HTMLElement;
    public readonly songs: SongList[];

    /**
     * Current playing song.
     */
    get currentSong() {
        return getSongByIndex(this.songs, this._currentSong);
    }
    /**
     * The index of current playing song.
     */
    get currentSongIndex() {
        return this._currentSong;
    }

    /**
     * Gets or set current time of audio.
     */
    get currentTime() {
        return this.audio ? this.audio.currentTime : NaN;
    }
    set currentTime(v) {
        this.audio ? this.audio.currentTime = v : "";
    }

    /**
     * Gets or sets the volume of audio.
     */
    get volume() {
        return this.audio ? this.audio.volume : NaN;
    }
    set volume(v) {
        this.audio ? this.audio.volume = v : "";
    }

    /**
     * Gets the duration of audio.
     */
    get duration() {
        return this.audio ? this.audio.duration : NaN;
    }

    /**
     * Gets or sets the playmode of the player.
     * @fires Player#playmodechange
     */
    get playmode() {
        return this._playmode;
    }
    set playmode(v) {
        const old = this._playmode;
        this._playmode = v;
        this._playmode.initialize(this);
        this.dispatchEvent(new PlaymodeChangeEvent(old, v));
    }

    /**
     * Gets the modules that used by the player.
     */
    get modules() {
        return this._modules;
    }

    /**
     * Creates an instance of the player.
     * @param parent - The parent element of the player.
     * @param options - Options that used by the player.
     */
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
        />, player);
    }

    /**
     * Change to next music in playlists.
     * @param user - Is the operation triggered by user?
     *
     * @fires Player#songchange
     */
    next(user = true) {
        this.playmode.handleNext(user);
    }

    /**
     * Change to previous music in playlists.
     * @param user - Is the operation triggered by user?
     *
     * @fires Player#songchange
     */
    previous(user = true) {
        this.playmode.handlePrevious(user);
    }

    /**
     * Continue playing or plays a music in playlists.
     * @param index - (Optional) The index of target music.
     */
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
            return this.audio ? this.audio.play() : "";
    }

    /**
     * Pauses the player.
     */
    pause() {
        this.audio ? this.audio.pause() : "";
    }

    /**
     * Loads a playlist to the player.
     * @param playlist - Playlist options.
     *
     * @fires Player#playlistload
     */
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
            this.play(index).then(() => console.log("Auto play started!")).catch(console.error);
        }
    }

    /**
     * Add module to the player.
     * @param module - The module that will be added to the player.
     */
    withModule(module: Module) {
        module.initialize(this);
        this._modules.push(module);
    }
}

/**
 * Song change event.
 * Triggered when current song changed.
 * @event Player#songchange
 * @type {SongChangeEvent}
 * @property {number} songIndex - The index of the new song.
 * @property {Song} song - The new song.
 * @property {string} provider - The provider of the new song.
 */

/**
 * Playlist loaded event.
 * Triggered when a playlist is loaded.
 * @event Player#playlistload
 * @type {PlaylistLoadEvent}
 * @property {Playlist} playlist - The playlist.
 */

/**
 * Playmode change event.
 * Triggered when the playmode is changed.
 * @event Playlist#playmodechange
 * @type {PlaymodeChangeEvent}
 * @property {Playmode} oldPlaymode - Previous playmode.
 * @property {Playmode} playmode - Current playmode.
 */

/**
 * Initializes an instance of the player.
 * @param options - Options or playlists that will be used to initialize the player.
 */
export function initialize(options?: PenguinPlayerOptions | Playlist[]): Player {
    const opt: PenguinPlayerOptions = {
        autoplay: true,
        ...(Array.isArray(options) ? {
            lists: options
        } : options)
    };

    if (opt.fixed && document.querySelector(".PPlayer--fixed"))
        throw Error("Only one instance of fixed player can be existed at once.");

    const instance = new Player(opt.parent, opt);
    if (opt.fixed)
        instance.root.classList.add("PPlayer--fixed");

    if (Array.isArray(opt.lists))
        for (const p of opt.lists) {
            instance.loadPlaylist(p).then(() => console.log("Playlist loaded")).catch(console.error);
        }

    return instance;
}