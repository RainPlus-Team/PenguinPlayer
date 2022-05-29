import {h} from "preact";
import I18NComponent from "./I18NComponent";

import WhatIsThis from "./sections/WhatIsThis";

import "../less/Content.less";
import Why from "./sections/Why";
import Features from "./sections/Features";

export default class Content extends I18NComponent<Record<string, never>, Record<string, never>> {
    static sections = {
        "section.what-is-this": WhatIsThis,
        "section.why": Why,
        "section.features": Features
    };

    render() {
        return <div className="Content">
            {Object.keys(Content.sections).map(section => {
                const Section = Content.sections[section];
                return <div className="Content--section" key={section}>
                    <h2 className="Content--section-title">🐧<span className="Content--section-penguin-emotion">{this.t(`${section}.emotion`)}</span>&nbsp;{this.t(`${section}.title`)}</h2>
                    <Section />
                </div>;
            })}
        </div>;
    }
}