const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const merge = require("webpack-merge").merge;

const es5 = require("./config/es5");
const es2015 = require("./config/es2015");
const LanguagePlugin = require("./demo/languagePlugin");
const DemoCopyPlugin = require("./plugins/demoCopyPlugin");

module.exports = env => {
    // Determine build mode
    let mode = "development";
    if (env.production) {mode = "production";}
    console.log("Compilation Mode: " + mode);

    // Compile variables
    //let enabledFlags = typeof env.flags === "string" ? env.flags.split(".") : [];

    const THEME = env.theme || "default";

    /*const compileOptions = {
        PRODUCTION: mode === "production",
        NO_STYLE: enabledFlags.indexOf("no-style") !== -1,
        THEME,
    }*/

    // Constants
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "package.json")).toString());
    const constants = {
        _VERSION_: JSON.stringify(pkg.version),
        _BUILD_DATE_: JSON.stringify(new Date().toString())
    }

    // Plugins
    let plugins = [
        new webpack.DefinePlugin(constants)
    ];

    // Optimization
    const optimization = {
        minimize: mode === "production",
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    ecma: 6,
                    compress: true,
                    output: { comments: false, beautify: false }
                },
                extractComments: false
            })
        ],
        runtimeChunk: false,
        splitChunks: {
            cacheGroups: {
                default: false
            }
        }
    };

    // Base Configuration
    const base = {
        mode,
        plugins,
        optimization,
        resolve: { extensions: [".wasm", ".mjs", ".ts", ".tsx", ".js", ".json"], alias: { Theme: path.resolve(__dirname, "themes/" + THEME + "/") } },
        module: {
            rules: [
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

    // Demo Configuration
    const demo = {
        plugins: [
            new HtmlWebpackPlugin({
                template: "demo/index.html",
                chunks: ["demo"],
                minify: true
            }),
            new CopyPlugin({
                patterns: [
                    {from: "demo/lang/", to: "lang/"},
                    {from: "demo/examples/", to: "examples/"}
                ]
            }),
            new LanguagePlugin()
        ],
        module: {
            rules: [
                {
                    test: /\.(png|jpg|bmp|webp)$/,
                    type: "asset/resource",
                    generator: {
                        filename: 'images/[name].[contenthash:5][ext]'
                    }
                },
                {
                    test: /\.(mp3|wav|ogg)$/,
                    type: "asset/resource",
                    generator: {
                        filename: 'sounds/[name].[contenthash:5][ext]'
                    }
                },
                {
                    resourceQuery: /raw/,
                    //type: 'asset/source',
                    use: "raw-loader" // asset/source doesn't work like raw-loader :/
                }
            ]
        }
    }

    // Webpack Configuration
    return [
        merge(merge(base, es2015), { // ES2015+
            entry: { player: path.resolve(__dirname, "src/ts/index.ts") },
            output: {
                path: path.resolve(__dirname, "dist/"),
                filename: "[name].mjs"
            },
            plugins: [
                new DemoCopyPlugin(),
                ...(mode === "development" ?
                [new BundleAnalyzerPlugin({openAnalyzer: false, analyzerPort: 8888})] : [])
            ]
        }),
        merge(merge(base, es5), { // ES5
            entry: { player: path.resolve(__dirname, "src/ts/index.ts") },
            output: {
                path: path.resolve(__dirname, "dist/"),
                filename: "[name].js"
            },
            plugins: [
                new DemoCopyPlugin(),
                ...(mode === "development" ?
                    [new BundleAnalyzerPlugin({openAnalyzer: false, analyzerPort: 8889})] : [])
            ]
        }),
        merge(merge(base, es2015), merge(demo, { // ES2015+
            entry: { demo: path.resolve(__dirname, "demo/demo.tsx") },
            output: {
                path: path.resolve(__dirname, "dist/demo/"),
                filename: "js/[name].[contenthash:5].js"
            }
        }))
    ]
}