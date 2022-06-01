import { join } from "path";
import { existsSync, readFileSync } from "fs";

import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";

// eslint-disable-next-line no-undef
const isProd = process.env.NODE_ENV === "production";

const packages = ["core", "modules/media_session", "ui"];

const commonPlugins = [
    typescript(),
    babel({ babelHelpers: "bundled" })
];
const prodPlugins = [
    terser({
        format: { comments: false }
    })
];

function getResult(input, file, format, min = false, plugins = []) {
    return {
        input,
        output: {
            sourcemap: !isProd,
            name: "PPlayer",
            file: min ? file.replace(/\.(m)?js$/, ".min.$1js") : file,
            format,
            exports: "default"
        },
        plugins: [
            ...plugins,
            ...commonPlugins,
            ...(min ? prodPlugins : [])
        ]
    };
}

function isPackageValid(p) {
    if (!existsSync(p)) {
        console.log(`Package ${p} cannot be found`);
        return false;
    }
    if (!existsSync(join(p, "package.json"))) {
        console.log(`${p} is not a valid package`);
        return false;
    }
    if (!existsSync(join(p, "src/index.ts"))) {
        console.log(`No entry point found for package ${p}`);
        return false;
    }
    return true;
}

const prodOnly = (input) => isProd ? input : undefined;

async function main() {
    /**
     * @type {import('rollup').RollupOptions[]}
     */
    const results = [];
    const addResult = (...r) => results.push(...r.filter(x => x !== undefined));

    for (const p of packages) {
        if (!isPackageValid(p))
            continue;

        const {
            //name,
            //version,
            main,
            module,
            bundle,
            entry
        } = JSON.parse(readFileSync(join(p, "package.json")).toString());

        const input = join(p, entry || "src/index.ts");

        addResult(
            getResult(input, join(p, main), "cjs"),
            getResult(input, join(p, module), "esm"),
            prodOnly(getResult(input, join(p, main), "cjs", true)),
            prodOnly(getResult(input, join(p, module), "esm", true))
        );

        if (bundle) {
            const bundlePlugs = [
                nodeResolve({
                    moduleDirectories: [join(p, "node_modules")]
                })
            ];
            addResult(
                getResult(input, join(p, bundle), "umd", false, bundlePlugs),
                prodOnly(getResult(input, join(p, bundle), "umd", true, bundlePlugs))
            );
        }
    }

    return results;
}

export default main();