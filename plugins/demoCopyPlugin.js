import fs from "fs";
import path from "path";

class DemoCopyPlugin {
    apply(compiler) {
        compiler.hooks.assetEmitted.tap("DemoCopyPlugin", (file, {compilation}) => {
            const p = path.resolve(compilation.compiler.outputPath, file);

            const demo = path.resolve(compilation.compiler.outputPath, "demo");
            if (!fs.existsSync(demo)) {
                fs.mkdirSync(demo);
            }

            const target = path.resolve(compilation.compiler.outputPath, "demo", file);
            fs.copyFileSync(p, target, fs.constants.COPYFILE_FICLONE);
        });
    }
}

export default DemoCopyPlugin;