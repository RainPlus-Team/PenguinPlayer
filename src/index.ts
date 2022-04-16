import { initialize } from "./player";
import {addPlaymode, playmodes} from "./playmode";
import {addProvider, providers} from "./provider";
import { themeConfig, useTheme } from "./theme";

import MediaSession from "./modules/media-session";

// Load default providers
import "./providers/file";
import "./providers/netease";

// Load default playmodes
import "./playmodes/list";
import "./playmodes/listloop";
import "./playmodes/singleloop";
import "./playmodes/random";

// eslint-disable-next-line
declare const define: any;

const exposes = {
    get providers() {
        return providers;
    },
    get playmodes() {
        return playmodes;
    },
    initialize,
    addProvider,
    addPlaymode,
    useTheme,
    themeConfig,
    modules: {
        MediaSession
    },
    version: _VERSION_
};

export type PenguinPlayerAPI = typeof exposes;

declare global {
    interface Window { PPlayer: PenguinPlayerAPI; }
}

(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.PPlayer = factory();
    }
    console.log("%cP%cPlayer v" + _VERSION_ + " is now ready~ %c(づ￣ 3￣)づ\n%cbuilt on " + _BUILD_DATE_, "color: #6cf;font-weight: bold;", "color: #7fb1c6;", "color: #ee0000;font-weight: bold;", "color: #ee0000;font-style: italic;");
}(typeof self !== "undefined" ? self : this, function () {
    return exposes;
}));