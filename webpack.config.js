const path = require("path");
const svgo = require("svgo");
const TerserPlugin = require("terser-webpack-plugin");

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
    if (env.production) {mode = "production";}
    console.log("Compilation Mode: " + mode);
    // Compile variables
    const ENABLE_IE_SUPPORT = env.ie !== undefined;
    const compileOptions = {
        PRODUCTION: mode === "production",
        IE_SUPPORT: ENABLE_IE_SUPPORT
    }
    // Optimization
    const optimization = {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    ecma: ENABLE_IE_SUPPORT ? 5 : 6,
                    compress: true,
                    output: { comments: false, beautify: false }
                },
                extractComments: false
            })
        ]
    };
    // Static configuration
    return {
        mode: mode,
        target: ENABLE_IE_SUPPORT ? ["web", "es5"] : undefined,
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
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    "@babel/preset-typescript",
                                    [ "@babel/preset-env", { "targets": { chrome: "46", ie: "10" } } ]
                                ]
                            }
                        },
                        {
                            loader: "ifdef-loader",
                            options: compileOptions
                        }
                    ]
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