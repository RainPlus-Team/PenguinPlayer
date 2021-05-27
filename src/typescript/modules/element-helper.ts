import { getThumbnail } from "./helper";

export function createSongElement(song: Song, click: () => void): HTMLElement {
    let songEl = document.createElement("div");
    songEl.classList.add("penguin-player__player--playlist-song");
    songEl.setAttribute("role", "listitem");
    songEl.addEventListener("click", click);
    let img = document.createElement("img");
    img.classList.add("penguin-player__player--playlist-thumbnail");
    img.classList.add("penguin-player--lazy");
    if (!song.thumbnailNoCrossOrigin)
        img.crossOrigin = "anonymous";
    img.alt = "封面";
    img.setAttribute("data-src", getThumbnail(song.thumbnail, 36));
    songEl.appendChild(img);
    let title = document.createElement("h1");
    title.classList.add("penguin-player__player--playlist-title");
    title.textContent = song.name;
    songEl.appendChild(title);
    let artists = document.createElement("p");
    artists.classList.add("penguin-player__player--playlist-artists");
    artists.textContent = song.artists;
    songEl.appendChild(artists);
    return songEl;
}

export function createLine(line: LyricLine, tLine?: LyricLine) {
    let l = document.createElement("p");
    l.classList.add("penguin-player__lyric-settings--full-view-line");
    if (line.value == "" || line.value == "\n")
        l.innerHTML = "&nbsp;";
    else {
        l.append(line.value);
        if (tLine) {
            let t = document.createElement("span");
            t.classList.add("penguin-player__lyric-settings--full-view-line-translate");
            t.textContent = tLine.value;
            l.append(document.createElement("br"), t);
        }
    }
    return l;
}