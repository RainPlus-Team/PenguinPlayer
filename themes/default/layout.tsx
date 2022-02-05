import { h, Component, Fragment } from "preact"

import Play from "./icons/play.svg";
import Pause from "./icons/pause.svg";
import Next from "./icons/next.svg";
import Previous from "./icons/previous.svg";
import Repeat from "./icons/repeat.svg";
import RepeatOne from "./icons/repeat_one.svg";
import Shuffle from "./icons/shuffle.svg";

import "./styles/theme.less";

export default class Player extends Component<PPlayerLayoutProps, PPlayerLayoutState> {
    constructor() {
        super();
        this.state = {
            currentTime: NaN,
            duration: NaN,
            song: null
        }
    }

    render() {
        return <>
            <div className="PPlayer--body">
                <div className="PPlayer--thumbnail">

                </div>
                <div className="PPlayer--full-modal">
                    <div className="PPlayer--play-pause">
                        <Play className="PPlayer--btn" />
                        <Pause className="PPlayer--btn" />
                    </div>
                </div>
            </div>
            <div className="PPlayer--lyric">

            </div>
        </>;
    }
}