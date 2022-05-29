import {h} from "preact";
import I18NComponent from "./I18NComponent";

import Vercel from "../..//assets/images/vercel-dark.svg";

import "../less/Header.less";

declare const VERSION: string;

export default class Header extends I18NComponent<Record<string, never>, Record<string, never>> {
    render() {
        return <div className="Header">
            <div className="Header--content">
                <img src="" className="Header--icon" alt={this.ts("header.icon")}/>
                <br/>
                <div className="Header--title">
                    <h1>Penguin Player</h1>
                    <p className="Header--version">v{VERSION}</p>
                </div>
                <p>{this.t("header.description")}</p>
                <div className="Header--badges">
                    <img src={`https://img.shields.io/github/languages/code-size/RainPlus-Team/PenguinPlayer?style=flat-square&label=${encodeURIComponent(this.ts("header.badges.code-size"))}`} alt={this.ts("header.badges.code-size-description")}/>
                    <img src={`https://img.shields.io/codeclimate/maintainability/RainPlus-Team/PenguinPlayer?style=flat-square&label=${encodeURIComponent(this.ts("header.badges.maintainability"))}`} alt={this.ts("header.badges.maintainability-description")}/>
                    <img src={`https://img.shields.io/github/downloads/RainPlus-Team/PenguinPlayer/total?style=flat-square&label=${encodeURIComponent(this.ts("header.badges.downloads"))}`} alt={this.ts("header.badges.downloads-description")}/>
                    <img src={`https://img.shields.io/github/license/RainPlus-Team/PenguinPlayer?style=flat-square&label=${encodeURIComponent(this.ts("header.badges.license"))}`} alt={this.ts("header.badges.license-description")}/>
                    <img src="https://img.shields.io/github/package-json/dependency-version/RainPlus-Team/PenguinPlayer/rollup?style=flat-square" alt={this.ts("header.badges.rollup-description")}/>
                </div>
            </div>
            <div className="Header--sponsors">
                <Vercel className="Header--sponsor-vercel"/>
                <p className="Header--photographer">{this.t("header.photographer", <a href="https://flic.kr/p/bcNWxF">Ronald Woan</a>)}</p>
            </div>
        </div>;
    }
}