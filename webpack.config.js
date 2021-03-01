const path = require("path");
const svgo = require("svgo");
const TerserPlugin = require("terser-webpack-plugin");

const optimization = {
    minimize: true,
    minimizer: [
        new TerserPlugin({
            terserOptions: {
                ecma: 5, // Compatible for IE
                compress: true,
                output: { comments: false, beautify: false }
            },
            extractComments: false
        })
    ]
};

const svgoFilter = function(text) {
    return svgo.optimize(text, {
        plugins: svgo.extendDefaultPlugins([
            {
                name: "removeXMLNS",
                active: true
            },
            {
                name: "removeViewBox",
                active: false
            }
        ])
    }).data;
}

module.exports = env => {
    // Determine build mode
    let mode = "development";
    try {if (env.production) {mode = "production";}} catch {}
    console.log("Compilation Mode: " + mode);
    // Static configuration
    return {
        mode: mode,
        target: ["web", "es5"],
        entry: { player: path.resolve(__dirname, "src/typescript/player.ts") },
        output: {
            path: path.resolve(__dirname, "dist/"),
            filename: "[name].js"
        },
        optimization: mode === "production" ? optimization : undefined,
        resolve: { extensions: [".wasm", ".mjs", ".ts", ".js", ".json"] },
        module: {
            rules: [
                {
                    test: /\.(js|ts)$/,
                    use: [ "babel-loader" ]
                },
                {
                    test: /\.pug$/,
                    use: [
                        "html-loader",
                        { loader: "pug-html-loader", options: { filters: { "svgo": svgoFilter } } }
                    ]
                },
                {
                    test: /\.(scss|sass)$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        "postcss-loader",
                        "sass-loader"
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        "postcss-loader"
                    ]
                },
                {
                    test: /\.svg$/,
                    use: [ { loader: "svgo-loader", options: { plugins: [ { removeXMLNS: true }, { removeViewBox: false } ] } } ]
                }
            ]
        }
    }
}