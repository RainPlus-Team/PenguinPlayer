import path from "path";
import svgToJsx from "svg-to-jsx";

function toUpperCamelCase(string) {
    return string.split(/[^a-zA-Z]+/).map(word =>
        word && word[0].toUpperCase() + word.slice(1)
    ).join("");
}

module.exports = function loader(content) {
    this.cacheable();

    const callback = this.async();
    const fileName = path.basename(this.resourcePath, ".svg");
    const componentName = toUpperCamelCase(fileName) || "Svg";

    svgToJsx(content, (err, jsx) => {
        if (err) {
            callback(err);
            return;
        }

        callback(null,
            "import { h } from 'preact';\n" +

            `class ${componentName} {` +
            "  render() {" +
            `    return (${jsx.replace(/(<svg[^>]*)(>)/i, "$1 {...this.props}$2")});` +
            "  }" +
            "}\n" +

            `export default ${componentName};`
        );
    });
};

module.exports.raw = true;