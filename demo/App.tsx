import {h, Component, createRef} from "preact";
import {IntlProvider, MarkupText, Text, Localizer} from "preact-i18n";
import {LocaleMatcher} from "@phensley/locale-matcher";
import {extend} from "./util";
import Prism from "prismjs";

import GitHub from "../assets/images/github.svg";
import Vercel from "../assets/images/vercel-dark.svg";

import Language from "../assets/icons/language_black_24dp.svg";

import SimpleInitialization from "./examples/simple.js?raw";

import defaultLanguage from "./lang/en.json";

declare const LANGUAGES: {[key: string]: string};

interface CodeProps {
    language?: string
    className?: string
}

class Code extends Component<CodeProps, any> {
    render() {
        const lang = this.props.language || "javascript";

        return <pre
            className={[`language-${lang}`, this.props.className]
                .filter(Boolean)
                .join(' ')}
        >
            <code className={`language-${lang}`} dangerouslySetInnerHTML={{__html: Prism.highlight(this.props.children, Prism.languages[lang])}}/>
        </pre>}
}

interface State {
    language: any,
    showLangList: boolean
}

export default class extends Component<any, State> {
    private langSelector = createRef();

    constructor() {
        super();

        this.state = {
            language: defaultLanguage,
            showLangList: false
        };

        const matcher = new LocaleMatcher(Object.keys(LANGUAGES));
        const match = matcher.match(navigator.language).locale.id;

        if (match != "en")
            this.loadLanguage(match);
    }

    loadLanguage(lang: string) {
        fetch("lang/" + lang + ".json").then(res => res.json()).then(lang => {
            // Apply fallbacks and apply it
            this.setState({
                language: extend(defaultLanguage, lang)
            });
            // Update lang attribute
            document.documentElement.lang = lang;
        }).catch(() => console.warn("Unable to load " + lang + " language file, using default language"));
    }

    componentDidMount() {
        //Prism.highlightAll();
        window.addEventListener("click", (e) => {
            const el = this.langSelector.current;
            if (!el || !el.contains(e.target))
                this.setState({showLangList: false});
        });
    }

    render(props) {
        return <IntlProvider definition={this.state.language}>
            <div className="Header">
                    <div ref={this.langSelector} className={["Language-Selector", (this.state.showLangList ? "Language-Selector--listed" : "")].join(" ")}>
                        <Localizer>
                            <button onClick={() => this.setState({showLangList: true})} className="Language-Button" title={<Text id="languages"/> as unknown as string}>
                                <Language/>
                            </button>
                            <strong style="vertical-align: super;"><Text id="languages"/></strong>
                        </Localizer>
                        <ul className="Language-List">
                            {Object.keys(LANGUAGES).map((v) =>
                                <li>
                                    <button onClick={() => this.loadLanguage(v)}>{LANGUAGES[v]}</button>
                                </li>
                            )}
                        </ul>
                    </div>
                <p style="font-size: 64px;margin: 0;">🐧</p>
                <h1><Text id="title"/><span className="Player-Version">v{_VERSION_}</span></h1>
                <p><Text id="description"/></p>
                <div className="GitHub-Link">
                    <a target="_blank" href="https://github.com/M4TEC/PenguinPlayer"><GitHub/></a>
                </div>
                <div className="Sponsors">
                    <a className="Vercel-Logo" href="https://vercel.com/?utm_source=pplayer&utm_campaign=oss">
                        <Vercel preserveAspectRatio="xMidYMid meet"/>
                    </a>
                    <span className="Background-Source">photo by <a href="https://flic.kr/p/bcNWxF" target="_blank">Ronald Woan</a></span>
                </div>
            </div>
            <div className="Container">
                <div className="Section">
                    <h2><sup className="penguin-mark">❓</sup>&nbsp;<Text id="sections.what.title"/></h2>
                    <MarkupText id="sections.what.content"/>
                </div>
                <div className="Section">
                    <h2><sup className="penguin-mark">✨</sup>&nbsp;<Text id="sections.features.title"/></h2>
                    <MarkupText id="sections.features.content"/>
                    <p><Text id="sections.features.more"/></p>
                </div>
                <div className="Section">
                    <IntlProvider definition={this.state.language} scope={"sections.how"}>
                        <h2><sup className="penguin-mark">❗</sup>&nbsp;<Text id="title"/></h2>
                        <h3><Text id="simple.title"/></h3>
                        <p><Text id="simple.introduce"/></p>
                        <Code>
                            {SimpleInitialization}
                        </Code>
                        <h3><Text id="advanced.title"/></h3>
                        <p><Text id="advanced.introduce"/></p>
                        <Code>
                            // Work in progress
                        </Code>
                    </IntlProvider>
                </div>
            </div>
            <div className="Footer">
                Maintained by <a href="https://m4tec.org" target="_blank">M4TEC</a> with <span title="Love">❤</span>.
            </div>
        </IntlProvider>
    }
}