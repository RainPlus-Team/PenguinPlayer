const path = require("path");
const svgo = require("svgo");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = env => {
    // Determine build mode
    let mode = "development";
    try {if (env.production) {mode = "production";}} catch {}
    console.log("Compilation Mode: " + mode);
    // Optimizations
    let optimization = undefined;
    if (mode === "production") {
        optimization = {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        ecma: 6,
                        compress: true,
                        output: {
                            comments: false,
                            beautify: false
                        }
                    },
                    extractComments: false
                })
            ]
        }
    }
    // Static configuration
    return {
        mode: mode,
        entry: {
            player: path.resolve(__dirname, "src/typescript/player.ts")
        },
        output: {
            path: path.resolve(__dirname, "dist/"),
            filename: "[name].js",
            publicPath: "/"
        },
        optimization: optimization,
        resolve: {
            extensions: [".wasm", ".mjs", ".ts", ".js", ".json"]
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts)$/,
                    use: [
                        "babel-loader"
                    ]
                },
                {
                    test: /\.pug$/,
                    use: [
                        "html-loader",
                        {
                            loader: "pug-html-loader",
                            options: {
                                filters: {
                                    "svgo": function(text) {
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
                                }
                            }
                        }
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
                    test: /\.svg$/,
                    use: [
                        {
                            loader: "svgo-loader",
                            options: {
                                plugins: [
                                    { removeXMLNS: true },
                                    { removeViewBox: false }
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    }
}