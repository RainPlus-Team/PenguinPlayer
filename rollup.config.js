import { join } from "path";
import { existsSync, readFileSync } from "fs";

import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";

const packages = ["core", "modules", "ui"];

const commonPlugins = [
    typescript(),
    babel({ babelHelpers: "bundled" })
];

async function main() {
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
                ...commonPlugins
            ]
        }, {
            input,
            output: {
                file: join(p, module),
                format: "esm"
            },
            plugins: [
                ...commonPlugins
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
                    ...commonPlugins
                ]
            });
        }
    }

    return results;
}

export default main();