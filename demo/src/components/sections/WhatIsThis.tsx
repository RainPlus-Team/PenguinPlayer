import {h} from "preact";
import I18NComponent from "../I18NComponent";

export default class WhatIsThis extends I18NComponent<Record<string, never>, Record<string, never>> {
    render() {
        return <p>{this.t("section.what-is-this.content")}</p>;
    }
}