import { initialize } from "./player";
import { addPlaymode } from "./playmode";
import { addProvider } from "./provider";
import { themeConfig, useTheme } from "./theme";

import MediaSession from "./media-session";

declare var define: any;

declare global {
    interface Window { PPlayer: any; }
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PPlayer = factory();
    }
    console.log("%cP%cPlayer is now ready~ %c(づ￣ 3￣)づ", "color: #6cf;font-weight: bold;", "color: #7fb1c6;", "color: #ee0000;font-weight: bold;");
}(typeof self !== 'undefined' ? self : this, function () {
    return {
        initialize,
        addProvider,
        addPlaymode,
        useTheme,
        themeConfig,
        modules: {
            MediaSession
        }
    };
}));