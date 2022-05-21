import { join } from "path";
import { existsSync, readFileSync } from "fs";

import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";

const packages = ["core", "modules/media_session", "ui"];

const commonPlugins = [
    typescript(),
    babel({ babelHelpers: "bundled" })
];
const prodPlugins = [
    terser({
        format: {
            comments: false
        }
    })
];

function getResult(input, file, format, prod, plugins) {
    const plug = plugins || [];
    return {
        input,
        output: {
            name: "PPlayer",
            file: prod ? file.replace(/\.(m)?js$/, ".min.$1js") : file,
            format,
            exports: "default"
        },
        plugins: [
            ...plug,
            ...commonPlugins,
            ...(prod ? prodPlugins : [])
        ]
    };
}

async function main() {
    // eslint-disable-next-line no-undef
    const isProd = process.env.NODE_ENV === "production";
    /**
     * @type {import('rollup').RollupOptions[]}
     */
    const results = [];

    for (const p of packages) {
        if (!existsSync(p)) {
            console.log(`Package ${p} cannot be found`);
            continue;
        }
        if (!existsSync(join(p, "package.json"))) {
            console.log(`${p} is not a valid package`);
            continue;
        }
        if (!existsSync(join(p, "src/index.ts"))) {
            console.log(`No entry point found for package ${p}`);
            continue;
        }

        const {
            name,
            version,
            main,
            module,
            bundle
        } = JSON.parse(readFileSync(join(p, "package.json")).toString());

        const input = join(p, "src/index.ts");

        results.push(getResult(input, join(p, main), "cjs", false), getResult(input, join(p, module), "esm", false));
        if (isProd)
            results.push(getResult(input, join(p, main), "cjs", true), getResult(input, join(p, module), "esm", true));

        if (bundle) {
            const bundlePlugs = [
                nodeResolve({
                    moduleDirectories: [join(p, "node_modules")]
                })
            ];
            results.push(getResult(input, join(p, bundle), "umd", false, bundlePlugs));
            if (isProd)
                results.push(getResult(input, join(p, bundle), "umd", true, bundlePlugs));
        }
    }

    return results;
}

export default main();