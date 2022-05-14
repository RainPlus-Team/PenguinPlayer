import { join } from "path";
import { existsSync, readFileSync } from "fs";

import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";

const packages = ["core", "modules", "ui"];

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

        results.push({
            input,
            output: {
                file: join(p, main),
                format: "cjs",
                exports: "default"
            },
            plugins: [
                ...commonPlugins,
                ...(isProd ? prodPlugins : [])
            ]
        }, {
            input,
            output: {
                file: join(p, module),
                format: "esm"
            },
            plugins: [
                ...commonPlugins,
                ...(isProd ? prodPlugins : [])
            ]
        });

        if (bundle) {
            results.push({
                input,
                output: {
                    file: join(p, bundle),
                    name: "PPlayer",
                    format: "umd"
                },
                plugins: [
                    nodeResolve({
                        moduleDirectories: [join(p, "node_modules")]
                    }),
                    ...commonPlugins,
                    ...(isProd ? prodPlugins : [])
                ]
            });
        }
    }

    return results;
}

export default main();