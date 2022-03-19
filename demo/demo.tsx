import {h, render} from "preact";

import "prismjs/themes/prism.min.css";
import "./style.less";

import App from "./App";

declare const PPlayer: any;

render(<App/>, document.body);

window.addEventListener("load", () => {
    if (!PPlayer || PPlayer.version != _VERSION_) {
        alert("Incompatible Penguin Player version, this demo is built for Penguin Player v" + _VERSION_ + ", but version " + PPlayer?.version + " is detected!");
    }
});