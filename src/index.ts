import {initialize} from "./player";
import {addPlaymode, playmodes} from "./playmode";
import {addProvider, providers} from "./provider";
import themes, {useTheme} from "./theme";

import MediaSession from "./modules/media-session";

// Load default provider
import "./providers/file";

// Load default playmodes
import "./playmodes/list";
import "./playmodes/listloop";
import "./playmodes/singleloop";
import "./playmodes/random";

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
    themes,
    modules: {
        MediaSession
    },
    version: _VERSION_
};

export type PenguinPlayerAPI = typeof exposes;

declare global {
    interface Window { PPlayer: PenguinPlayerAPI; }
}

export default exposes;