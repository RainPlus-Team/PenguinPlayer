import Player, {Options} from "./player";

const defaultOptions = {
    autoplay: false
};

function initialize(options: Options): Player {
    const opt = {
        ...defaultOptions,
        ...options
    };

    const p =  new Player();

    return p;
}

export default {
    initialize
};