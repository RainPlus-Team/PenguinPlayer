import {h, Fragment, Component, createContext} from "preact";
import {LocaleMatcher} from "@phensley/locale-matcher";

import {loadLanguageFonts} from "../i18n";

import "../less/App.less";

import Header from "./Header";
import Content from "./Content";

import en from "../../languages/en.json";

const langMatcher = new LocaleMatcher("en, zh-CN");
const langCache = {};
const defLang = {
    lang: "en",
    strings: en.strings as Strings
};

type Strings = {
  [key: string]: string | Strings;
};

export const LanguageContext = createContext(defLang);

export default class App extends Component<Record<string, never>, {
    lang: string,
    strings: Strings
}> {
    constructor(props) {
        super(props);

        this.state = defLang;
        loadLanguageFonts(en.fonts);

        const lang = langMatcher.match(navigator.language);
        if (lang.locale.id != "en")
            this.loadLanguage(lang.locale.id);
    }

    loadLanguage(lang: string) {
        if (langCache[lang]) {
            const {fonts, strings} = langCache[lang];
            this.setState({
                lang,
                strings
            });
            loadLanguageFonts(fonts);
            document.documentElement.setAttribute("lang", lang);
        } else {
            fetch(`locales/${lang}.json`)
                .then(res => res.json())
                .then(l => {
                    langCache[lang] = {fonts: l.fonts, strings: l.strings};
                    this.setState({
                        lang,
                        strings: l.strings
                    });
                    loadLanguageFonts(l.fonts);
                    document.documentElement.setAttribute("lang", lang);
                });
        }
    }

    render() {
        return <>
            <LanguageContext.Provider value={this.state}>
                <Header/>
                <Content/>
            </LanguageContext.Provider>
        </>;
    }
}