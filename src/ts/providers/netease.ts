import { Song } from "../player";
import { Playlist } from "../playlist";
import { addProvider, Provider } from "../provider";

interface NeteaseSong extends Song {
    id: string
    thumbnail: string
}

interface NeteasePlaylist extends Playlist {
    id: string
}

class NeteaseProvider implements Provider {
    async fetchPlaylist(list: NeteasePlaylist): Promise<NeteaseSong[]> {
        const data = await fetch("https://gcm.tenmahw.com/resolve/playlist?id=" + list.id).then(res => res.json()).catch(console.error);
        const tracks = data.playlist.tracks;
        const songs: NeteaseSong[] = [];
        for (let track of tracks) {
            const id = track.id;
            const name = track.name;
            const artists = (track.ar as Array<any>).map((ar: any) => (ar.name as string));
            songs.push({
                id,
                name,
                artists,
                thumbnail: track.al.picUrl
            });
        }
        return songs;
    }

    async fetchUrl(song: NeteaseSong): Promise<string> {
        const data = await fetch("https://gcm.tenmahw.com/song/url?id=" + song.id).then(res => res.json()).catch(console.error);
        return data.data[0].url;
    }

    async fetchThumbnail(song: NeteaseSong) {
        return song.thumbnail;
    }
}

addProvider("netease", new NeteaseProvider());