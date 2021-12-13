const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = env => {
    // Determine build mode
    let mode = "development";
    if (env.production) {mode = "production";}
    console.log("Compilation Mode: " + mode);

    // Compile variables
    let enabledFlags = typeof env.flags === "string" ? env.flags.split(".") : [];

    const THEME = env.theme || "default";

    const compileOptions = {
        PRODUCTION: mode === "production",
        NO_STYLE: enabledFlags.indexOf("no-style") !== -1,
        THEME,
    }

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
                    ecma: 6,
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
        entry: { player: path.resolve(__dirname, "src/ts/app.tsx") },
        output: {
            path: path.resolve(__dirname, "dist/"),
            filename: "[name].js"
        },
        plugins,
        optimization: mode === "production" ? optimization : undefined,
        resolve: { extensions: [".wasm", ".mjs", ".ts", ".tsx", ".js", ".json"], alias: { Theme: path.resolve(__dirname, "themes/" + THEME + "/") } },
        module: {
            rules: [
                {
                    test: /\.(js|ts|tsx)$/,
                    use: [
                        "babel-loader",
                        {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: true
                            }
                        },
                        {
                            loader: "ifdef-loader",
                            options: compileOptions
                        }
                    ]
                },
                {
                    test: /\.(css|less)$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        "postcss-loader",
                        "less-loader"
                    ]
                },
                {
                    test: /\.svg$/,
                    use: [
                        "babel-loader",
                        {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: true,
                                appendTsxSuffixTo: [/\.svg$/]
                            }
                        },
                        "./loaders/svgToJsxLoader.js"
                    ]
                }
            ]
        }
    }
}