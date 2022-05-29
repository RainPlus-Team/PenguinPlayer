import {Component} from "preact";
import {useContext} from "preact/compat";
import {LanguageContext} from "./App";
import {jsonPathToValue} from "../util";

export default abstract class I18NComponent<P, S> extends Component<P, S> {
    ts(key: string, ...args: any[]): string {
        const translation = useContext(LanguageContext);
        const text = jsonPathToValue(translation.strings, key) as string;
        if (text) {
            return text.replace(/\{(\d+)}/g, (_, index) => args[index]);
        }
        return key;
    }

    t(key: string, ...args: any[]): Array<any> {
        const translation = useContext(LanguageContext);
        const text = jsonPathToValue(translation.strings, key) as string;
        if (text) {
            const parts = text.split(/(\{\d+})/g);
            return parts.map((part) => {
                if (part.startsWith("{") && part.endsWith("}")) {
                    const index = parseInt(part.substring(1, part.length - 1));
                    return args[index];
                } else {
                    return part;
                }
            });
        }
        return [key];
    }
}