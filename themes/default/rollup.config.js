import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: "layout.tsx",
    output: [
        {
            file: "dist/theme.js",
            format: "cjs"
        },
        {
            file: "dist/theme.esm.js",
            format: "esm"
        },
        {
            file: "dist/theme.bundle.js",
            format: "umd"
        }
    ],
    plugins: [typescript(), babel({babelHelpers: "bundled", extensions: [".jsx", ".tsx", ".js", ".ts"]})]
};

export default config;