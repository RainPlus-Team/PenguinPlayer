/*eslint @typescript-eslint/no-var-requires: "off" */
/*eslint-env node*/
const fs = require("fs");
const path = require("path");
const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

const pkg = JSON.parse(fs.readFileSync("../package.json").toString());
const version = pkg.version;

module.exports = {
    mode: isProd ? "production" : "development",
    entry: "./src/index.tsx",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "js/app.js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/template.html",
            filename: "index.html"
        }),
        new DefinePlugin({
            VERSION: JSON.stringify(version)
        }),
        new CopyPlugin({
            patterns: [
                {from: "languages", to: "locales/"}
            ]
        }),
    ],
    optimization: {
        minimize: isProd,
        minimizer: [new TerserWebpackPlugin()]
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
    },
    module: {
        rules: [
            {
                test: /\.[j|t]s(x?)$/,
                use: [
                    "babel-loader",
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
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
};