let _theme: new () => Theme;

const themes = {
    get current() {
        return _theme;
    }
};

export default themes;

/**
 * Set the default theme.
 * @param theme - The instance of the theme.
 */
export function useTheme(theme: new () => Theme) {
    _theme = theme;
}