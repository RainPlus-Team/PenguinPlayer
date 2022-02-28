import defaultTheme from "Theme/layout";

let _theme: new() => Theme = defaultTheme;

export const themeConfig = {
    get defaultTheme() : new() => Theme {
        return defaultTheme;
    },
    get currentTheme() : new() => Theme {
        return _theme;
    }
}

export function useTheme(theme: new () => Theme) {
    _theme = theme;
}