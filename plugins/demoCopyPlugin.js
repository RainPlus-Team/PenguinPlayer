const fs = require("fs");
const path = require("path");

class DemoCopyPlugin {
    apply(compiler) {
        compiler.hooks.done.tap("DemoCopyPlugin", (stats) => {
            const files = Object.keys(stats.compilation.assets);
            for (let file of files) {
                const p = path.resolve(stats.compilation.compiler.outputPath, file);
                const target = path.resolve(stats.compilation.compiler.outputPath, "demo", file);
                fs.copyFileSync(p, target, fs.constants.COPYFILE_FICLONE);
            }
        });
    }
}

module.exports = DemoCopyPlugin;