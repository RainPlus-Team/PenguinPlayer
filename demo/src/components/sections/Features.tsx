import {h, Fragment} from "preact";
import I18NComponent from "../I18NComponent";

export default class Features extends I18NComponent<Record<string, never>, Record<string, never>> {
    render() {
        return <>
            <ul>
                <li>{this.t("section.features.modular")}</li>
                <li>{this.t("section.features.flexible")}</li>
                <li>{this.t("section.features.in-ts")}</li>
            </ul>
            <p><i>{this.t("section.features.more")}</i></p>
        </>;
    }
}