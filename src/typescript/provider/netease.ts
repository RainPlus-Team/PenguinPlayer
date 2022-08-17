import { print } from "../modules/helper";
import ajax from "../modules/ajax";
import { updateTrialInfo } from "../controller";
import CancelablePromise from "../modules/cancelable-promise";

function getPlaylist(id: string): Promise<Song[]> {
    return new Promise((resolve, reject) => {
        ajax(`https://ncm.tenmahw.com/resolve/playlist?id=${id}`).send().then((result: AjaxResponse) => {
            if (result.data != null && result.data.code == 200) {
                let songs: NeteaseSong[] = [];
                let list = result.data.playlist;
                for (let track of list.tracks) {
                    let artists = "";
                    for (let artist of track.ar) artists += `, ${artist.name}`;
                    songs.push({ provider: "netease", id: track.id, name: track.name, artists: artists.substring(2), album: track.al.name, thumbnail: track.al.picUrl.replace("http:", "https:") + "?param=%width%y%height%", duration: track.dt / 1000 });
                }
                resolve(songs);
            } else reject(result.data.code);
        }).catch(reject);
    });
}

let lyricReq: AjaxPromise;

function getLyric(song: NeteaseSong): CancelablePromise<Lyric> {
    return new CancelablePromise((resolve, reject) => {
        lyricReq?.cancel();
        lyricReq = ajax(`https://ncm.tenmahw.com/resolve/lyric?id=${song.id}`).send().then((result: AjaxResponse) => {
            let lyric = result.data?.lyric;
            resolve({
                lrc: lyric?.lrc,
                translatedLrc: lyric?.tlrc
            });
        }).catch(reject);
    }, () => lyricReq?.cancel());
}

let currentUrlReq: AjaxPromise;

function getUrl(song: NeteaseSong): CancelablePromise<string> {
    return new CancelablePromise((resolve, reject) => {
        currentUrlReq?.cancel();
        currentUrlReq = ajax(`https://ncm.tenmahw.com/song/url?id=${(song as NeteaseSong).id}`).send().then((result: AjaxResponse) => {
            if (result.data.code == 200) {
                let track = result.data.data[0];
                if (track.url) {
                    if (track.freeTrialInfo)
                        updateTrialInfo({
                            startTime: track.freeTrialInfo.start,
                            endTime: track.freeTrialInfo.end
                        });
                    resolve(track.url.replace("http:", "https:"));
                } else { print(`${song.name} is unavailable`); reject(); }
            } else reject();
        }).catch(reject);
    }, () => currentUrlReq?.cancel());
}

export default <NeteaseProvider>{
    type: "netease",
    getPlaylist, getLyric, getUrl
}
