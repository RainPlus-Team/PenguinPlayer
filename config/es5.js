const es5 = {
    module: {
        rules: [
            {
                test: /\.(m?js|ts|tsx)$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    modules: false,
                                    useBuiltIns: "usage",
                                    corejs: 3,
                                    targets: {
                                        browsers: [
                                            '> 1%',
                                            'last 2 versions',
                                            'Firefox ESR',
                                        ],
                                    },
                                }],
                            ],
                        },
                    },
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            },
        ]
    }
};

module.exports = es5;