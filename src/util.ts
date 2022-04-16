/**
 * Shuffles an array.
 * @param array - Target array.
 */
export function shuffle<T>(array: Array<T>) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Transform http to https according to current page protocol.
 * @param url - The URL
 */
export function httpsAdapter(url: string): string {
    try {
        const urlInst = new URL(url);
        if (location.protocol == "https:" && urlInst.protocol == "http:") {
            urlInst.protocol = "https:";
            return urlInst.toString();
        }
        return url;
    } catch {
        return url;
    }
}