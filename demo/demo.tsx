import {h, render} from "preact";
import {PenguinPlayerAPI} from "../src";
import {Player} from "../src/player";

import Theme from "../themes/default";

//import "prismjs/themes/prism.min.css";
import "./style.less";

import App from "./components/App";

import Calm from "../assets/songs/calm/calm.ogg";
import CalmArtwork from "../assets/songs/calm/artwork.jpg";

import Relax from "../assets/songs/relax/Relax.ogg";
import RelaxArtwork from "../assets/songs/relax/artwork.jpg";

import OnceUponATime from "../assets/songs/onceuponatime/Once-Upon-A-Time-by-Oleg-Mazur.ogg";
import OnceUponATimeArtwork from "../assets/songs/onceuponatime/artwork.jpg";

declare global {
    interface Window { PInst?: Player; }
}

declare const PPlayer: PenguinPlayerAPI;

render(<App/>, document.body);

window.addEventListener("load", () => {
    if ("PPlayer" in window) {
        if (PPlayer.version != _VERSION_) {
            alert("Incompatible Penguin Player version, this demo is built for Penguin Player v" + _VERSION_ + ", but version " + PPlayer?.version + " is detected!");
        } else {
            // PPlayer compatible, initialize
            PPlayer.useTheme(Theme);

            window.PInst = PPlayer.initialize();
            window.PInst
                .withModule(new PPlayer.modules.MediaSession())
                .loadPlaylist({
                    provider: "file",
                    songs: [
                        {
                            name: "Calm",
                            artists: [
                                "Jarod The Sixth"
                            ],
                            thumbnail: CalmArtwork,
                            url: Calm
                        },
                        {
                            name: "Relax",
                            artists: [
                                "Peyruis"
                            ],
                            thumbnail: RelaxArtwork,
                            url: Relax
                        },
                        {
                            name: "Once Upon A Time",
                            artists: [
                                "Oleg Mazur"
                            ],
                            thumbnail: OnceUponATimeArtwork,
                            url: OnceUponATime
                        }
                    ]
                } as never);
            /*window.PInst.loadPlaylist({
                provider: "netease",
                id: "7332275167"
            } as never);*/
        }
    } else {
        alert("Penguin Player not detected, is it fail to load or it contains some fatal error?");
    }
});