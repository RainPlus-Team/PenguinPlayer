import {Song} from "./player";
import {SongList} from "./playlist";
import {Playmode} from "./playmode";

/**
 * Triggered when current song changed.
 */
export class SongChangeEvent extends Event {
    public readonly songIndex?: number;
    public readonly song: Song;
    public readonly provider: string;

    constructor(song: Song, provider: string, index?: number) {
        super("songchange");

        this.songIndex = index;
        this.song = song;
        this.provider = provider;
    }
}

/**
 * Triggered when a playlist is loaded.
 */
export class PlaylistLoadEvent extends Event {
    public readonly playlist: SongList;

    constructor(list: SongList) {
        super("playlistload");

        this.playlist = list;
    }
}

/**
 * Triggered when the playmode is changed.
 */
export class PlaymodeChangeEvent extends Event {
    public readonly oldPlaymode: Playmode;
    public readonly playmode: Playmode;

    constructor(old: Playmode, playmode: Playmode) {
        super("playmodechange");

        this.oldPlaymode = old;
        this.playmode = playmode;
    }
}