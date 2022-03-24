const es5 = {
    module: {
        rules: [
            {
                resource: {
                    and: [/\.m?[jt]sx?$/],
                    not: [/core-js/]
                },
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            sourceType: "unambiguous",
                            presets: [
                                ['@babel/preset-env', {
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