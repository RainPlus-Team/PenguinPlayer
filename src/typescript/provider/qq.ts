function getPlaylist(id: string): Promise<Song[]> {
    return new Promise((resolve, reject) => {
        reject("WIP");
    });
}

function getUrl(song: QQSong): Promise<string> {
    return new Promise((resolve, reject) => {
        reject("WIP");
    });
}

export default <QQProvider>{
    type: "qq",
    getPlaylist, getUrl
}