import {h, render} from "preact";

import "prismjs/themes/prism.min.css";
import "./style.less";

import App from "./components/App";

declare const PPlayer: any;

render(<App/>, document.body);

window.addEventListener("load", () => {
    if ('PPlayer' in window) {
        if (PPlayer.version != _VERSION_) {
            alert("Incompatible Penguin Player version, this demo is built for Penguin Player v" + _VERSION_ + ", but version " + PPlayer?.version + " is detected!");
        }
    } else {
        alert("Penguin Player not detected, is it fail to load or it contains some fatal error?");
    }
});