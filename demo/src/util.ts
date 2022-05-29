export function jsonPathToValue(jsonData: Record<never, never>, path: string) {
    if (!(jsonData instanceof Object) || typeof (path) === "undefined") {
        return path;
    }

    path = path.replace(/\[(\w+)]/g, ".$1");
    path = path.replace(/^\./, "");

    const pathArray = path.split(".");
    for (let i = 0, n = pathArray.length; i < n; ++i) {
        const key = pathArray[i];
        if (key in jsonData) {
            if (jsonData[key] !== null) {
                jsonData = jsonData[key];
            } else {
                return null;
            }
        } else {
            return path;
        }
    }

    return jsonData;
}  