export interface LanguageFonts {
    external: string[],
    family: string
}

let fontLink: HTMLLinkElement = null;

export function loadLanguageFonts(fonts: LanguageFonts) {
    document.body.style.fontFamily = "";
    if (fontLink) {
        document.head.removeChild(fontLink);
    }
    if (fonts) {
        fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = `https://fonts.googleapis.com/css2?${fonts.external.map((v) => `family=${v}`).join("&")}&display=swap`;
        document.head.appendChild(fontLink);
        document.body.style.fontFamily = fonts.family;
    }
}