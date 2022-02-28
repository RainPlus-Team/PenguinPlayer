import defaultTheme from "Theme/layout";

let _theme: new() => Theme = defaultTheme;

export const ThemeManager = {
    get currentTheme() : new() => Theme {
        return 
    }
}

export function useTheme(theme: new () => Theme) {
    _theme = theme;
}