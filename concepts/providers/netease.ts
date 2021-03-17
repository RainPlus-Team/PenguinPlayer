import { ILyric, IMusicProvider, ISong } from "../concepts";

interface INeteaseTrialInfo {
    startTime: number
    endTime: number
}

interface NeteaseSong extends ISong {
    id: string
    duration: number
    thumbnail: string
    trialInfo?: INeteaseTrialInfo
}

class NeteaseProvider implements IMusicProvider {
    public name: string = "网易云音乐";

    private audio: HTMLAudioElement;
    private currentSong: NeteaseSong;

    getPlaylist(options: string): Promise<ISong[]> {
        throw new Error("Method not implemented.");
    }
    getLyric(song: NeteaseSong): Promise<ILyric> {
        throw new Error("Method not implemented.");
    }
    getThumbnail(song: NeteaseSong): Promise<string> {
        throw new Error("Method not implemented.");
    }
    get isReady(): boolean {
        return true;
    }
    play(song?: NeteaseSong): void {
        if (song) {
            throw new Error("Method not implemented.");
        } else {
            this.audio.play();
        }
    }
    pause(): void {
        this.audio.pause();
    }
    get duration(): number {
        return this.currentSong.duration;
    }
    get currentTime(): number {
        return this.audio.currentTime;
    }
    set currentTime(time: number) {
        this.audio.currentTime = time;
    }
    get paused(): boolean {
        return this.audio.paused;
    }
    initialize(): Promise<boolean> {
        this.audio = document.createElement("audio");
        this.audio.crossOrigin = "anonymous";
        this.audio.classList.add("penguin-player__provider-netease-audio");
        document.querySelector(".penguin-player").appendChild(this.audio);
        return new Promise((resolve) => {resolve(true);});
    }
    destroy(): void {
        this.audio.parentNode.removeChild(this.audio);
    }
    
}