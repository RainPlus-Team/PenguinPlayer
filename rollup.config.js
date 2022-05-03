import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";
import * as fs from "fs";
import replace from "@rollup/plugin-replace";
import nodeResolve from "@rollup/plugin-node-resolve";

// Constants
const pkg = JSON.parse(fs.readFileSync("package.json").toString());
const constants = {
    _VERSION_: JSON.stringify(pkg.version),
    _BUILD_DATE_: JSON.stringify(new Date().toString())
};

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: "src/index.ts",
    output: [
        {
            file: "dist/cjs/player.js",
            format: "cjs",
            exports: "default"
        },
        {
            file: "dist/cjs/player.min.js",
            format: "cjs",
            exports: "default",
            plugins: [terser()]
        },
        {
            file: "dist/esm/player.js",
            format: "esm",
            exports: "default"
        },
        {
            file: "dist/esm/player.min.js",
            format: "esm",
            exports: "default",
            plugins: [terser()]
        },
        {
            name: "PPlayer",
            file: "dist/player.js",
            format: "umd",
            exports: "default",
        },
        {
            name: "PPlayer",
            file: "dist/player.min.js",
            format: "umd",
            exports: "default",
            plugins: [terser()]
        }
    ],
    plugins: [typescript(), babel({babelHelpers: "bundled"}), replace(constants), nodeResolve()]
};

export default config;