/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: "src/index.ts",
    output: [
        {
            file: "dist/cjs/player.js",
            format: "cjs"
        }
    ]
};

export default config;