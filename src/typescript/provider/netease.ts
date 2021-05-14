import ajax from "../modules/ajax";

export function getPlaylist(id: string): Promise<Song[]> {
    return new Promise((resolve, reject) => {
        ajax(`https://gcm.tenmahw.com/resolve/playlist?id=${id}`).send().then((result: AjaxResponse) => {
            if (result.data != null && result.data.code == 200) {
                let songs: NeteaseSong[] = [];
                let list = result.data.playlist;
                for (let track of list.tracks) {
                    let artists = "";
                    for (let artist of track.ar) { artists += `, ${artist.name}`; }
                    songs.push({ provider: "netease", id: track.id, name: track.name, artists: artists.substring(2), album: track.al.name, thumbnail: track.al.picUrl.replace("http:", "https:"), duration: track.dt / 1000 });
                }
                resolve(songs);
            } else {
                reject(result.data.code);
            }
        }).catch(reject);
    });
}

let lyricReq: AjaxPromise;

export function getLyric(id: string): Promise<Lyric> {
    return new Promise((resolve, reject) => {
        if (lyricReq) { lyricReq.cancel(); }
        lyricReq = ajax(`https://gcm.tenmahw.com/resolve/lyric?id=${id}`).send().then((result: AjaxResponse) => {
            let lyric = result.data?.lyric;
            resolve({
                lrc: lyric?.lrc,
                translatedLrc: lyric?.tlrc
            });
        }).catch(reject);
    });
}