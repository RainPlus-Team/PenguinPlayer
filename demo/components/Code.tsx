import {Component, h} from "preact";
import Prism from "prismjs";

interface CodeProps {
    language?: string
    className?: string
    i18nName?: string
    i18nLang?: string
}

interface CodeState {
    i18nCode?: string
}

export default class extends Component<CodeProps, CodeState> {
    constructor() {
        super();

        this.state = {
            i18nCode: null
        }
    }

    componentDidUpdate(previousProps: Readonly<CodeProps>, previousState: Readonly<CodeState>, snapshot: any) {
        if (previousProps.i18nLang != this.props.i18nLang && typeof this.props.i18nLang === "string") {
            // New language
            fetch(`examples/${this.props.i18nName}.${this.props.i18nLang}.txt`).then(res => {
                if (res.ok)
                    res.text().then((j) => {
                        this.setState({
                            i18nCode: j
                        })
                    })
                else
                    throw "Unable to load localized code";
            }).catch(() => this.setState({i18nCode: null}));
        }
    }

    render() {
        const lang = this.props.language || "javascript";

        return <pre
            className={[`language-${lang}`, this.props.className]
                .filter(Boolean)
                .join(' ')}
        >
            <code className={`language-${lang}`} dangerouslySetInnerHTML={{__html: Prism.highlight(this.state.i18nCode || this.props.children, Prism.languages[lang])}}/>
        </pre>}
}