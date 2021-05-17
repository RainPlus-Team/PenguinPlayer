function luminance(r: number, g: number, b: number): number {
    let a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1: Color, rgb2: Color): number {
    let lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
    let lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
    let brightest = Math.max(lum1, lum2);
    let darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

export function isBright(color: Color): boolean {
    return ((color[0] * 299) + (color[1] * 587) + (color[2] * 114)) / 1000 >= 125;
}

export function findHighestContrastColor(background: Color, colors: Color[]): Color {
    let contrasts = [];
    for (let color of colors)
        contrasts.push(contrast(background, color));
    let bestContrast = Math.max.apply(null, contrasts);
    if (bestContrast < 4.5)
        return isBright(background) ? [0, 0, 0] : [255, 255, 255];
    else
        return colors[contrasts.indexOf(bestContrast)];
}