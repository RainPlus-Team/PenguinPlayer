const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

class LanguagePlugin {
    apply(compiler) {
        compiler.hooks.beforeCompile.tap("LanguagePlugin", (_) => {
            const lang = [];
            const files = fs.readdirSync(path.resolve(__dirname, "lang"));
            for (let file of files) {
                lang.push(path.parse(file).name);
            }
            const plug = new webpack.DefinePlugin({
                LANGUAGES: JSON.stringify(lang)
            });
            plug._IS_LANG_ = true;

            let exists = false;
            for (let i = 0;i<compiler.options.plugins.length;i++) {
                if (compiler.options.plugins[i]._IS_LANG_) {
                    compiler.options.plugins.splice(i, 1); // TODO: Remove DefinePlugin completely
                    exists = true;
                }
            }
            if (!exists) { // Only apply once due to conflict for now
                compiler.options.plugins.push(plug);
                plug.apply(compiler);
            }
        });
    }
}

module.exports = LanguagePlugin;