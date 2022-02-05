import { Song } from "../player";
import { Playlist } from "../playlist";
import { addProvider, Provider } from "../provider";

interface FileSong extends Song {
    thumbnail: string
    url: string
}

interface FilePlaylist extends Playlist {
    songs: FileSong[]
}

class FileProvider implements Provider {
    async fetchPlaylist(list: FilePlaylist): Promise<FileSong[]> {
        return list.songs;
    }
    
    async fetchUrl(song: FileSong): Promise<string> {
        return song.url;
    }

    async fetchThumbnail(song: FileSong): Promise<string> {
        return song.thumbnail;
    }
}

addProvider("file", new FileProvider());