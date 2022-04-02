const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

class LanguagePlugin {
    apply(compiler) {
        compiler.hooks.beforeCompile.tapAsync("LanguagePlugin", (params, callback) => {
            const lang = {};
            const langPath = path.resolve(__dirname, "lang");
            const files = fs.readdirSync(langPath);
            for (let file of files) {
                const l = path.parse(file).name;
                lang[l] = JSON.parse(fs.readFileSync(path.resolve(langPath, file)).toString()).name;
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
            callback();
        });
    }
}

module.exports = LanguagePlugin;