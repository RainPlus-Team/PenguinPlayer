import ajax from "../modules/ajax";
import { addEventListeners } from "../modules/event";

function getPlaylist(id: string): Promise<Song[]> {
    return new Promise((resolve, reject) => {
        ajax(`https://qyapi.tenmahw.com/songlist?id=${id}`).then((res: AjaxResponse) => {
            if (res.data != null && res.code == 200 && res.data.result == 100) {
                let songs: QQSong[] = [];
                for (let song of res.data.data.songlist) {
                    if (song.size128 == 0 && song.size320 == 0 && song.sizeogg == 0) continue;
                    let artists = "";
                    for (let artist of song.singer) {
                        if (artists != "") artists += ", ";
                        artists += artist.name;
                    }
                    songs.push({
                        provider: "qq",
                        id: song.songmid,
                        name: song.songname,
                        thumbnail: `https://y.qq.com/music/photo_new/T002R300x300M000${song.albummid}.jpg`,
                        thumbnailNoCrossOrigin: true,
                        artists,
                        album: song.albumname
                    });
                }
                resolve(songs);
            } else {reject()}
        }).catch(reject).send();
    });
}

function getUrl(song: QQSong): Promise<string> {
    return new Promise((resolve, reject) => {
        (<any>window).penguinplayer_qqmusic_callback = function(data: any) {
            delete (<any>window).penguinplayer_qqmusic_callback;
            if (data.code == 0 && data.url_mid.code == 0 && data.url_mid.data.midurlinfo.length >= 1) {
                resolve(data.url_mid.data.midurlinfo[0].purl);
            }
        }
        let script = document.createElement("script");
        script.src = `https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&uin=0&format=json&callback=penguinplayer_qqmusic_callback&data=${
            encodeURIComponent(JSON.stringify({"comm":{"ct":23,"cv":0},"data_mid":{"module":"track_info.UniformRuleCtrlServer","method":"GetTrackInfo","param":{"mids":[song.id],"types":[0]}},"url_mid":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"1697065986","songmid":[song.id],"songtype":[0],"uin":"0","loginflag":0,"platform":"23"}}}))
        }&_=${new Date().valueOf()}`;
        addEventListeners(script, "load error", function(e: Event) {
            script.parentElement.removeChild(script);
            if (e.type == "error") reject();
        });
        document.body.appendChild(script);
    });
}

export default <QQProvider>{
    type: "qq",
    getPlaylist, getUrl
}