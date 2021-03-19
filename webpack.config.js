const path = require("path");
const svgo = require("svgo");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

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
    let enabledFlags = typeof env.flags === "string" ? env.flags.split(".") : [];
    const ENABLE_IE_SUPPORT = enabledFlags.indexOf("ie") !== -1;
    const compileOptions = {
        PRODUCTION: mode === "production",
        IE_SUPPORT: ENABLE_IE_SUPPORT,
        NO_STYLE: enabledFlags.indexOf("no-style") !== -1
    }
    // Compile targets
    let targets = {
        chrome: "70"
    }
    if (ENABLE_IE_SUPPORT) {targets.ie = "10";}
    // Plugins
    let plugins = [];
    if (mode == "development") {
        plugins.push(new BundleAnalyzerPlugin({openAnalyzer: false}));
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
        externals: {
            "./polyfills": "''"
        },
        plugins,
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
                                    [ "@babel/preset-env", { targets, modules: false, shippedProposals: true } ]
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
                    use: [
                        "raw-loader",
                        { loader: "svgo-loader", options: { plugins: svgo.extendDefaultPlugins([ "removeXMLNS", { name: "removeViewBox", active: false } ]) } }
                    ]
                }
            ]
        }
    }
}