const es2015 = {
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
                            presets: [
                                ['@babel/preset-env', {
                                    useBuiltIns: "usage",
                                    corejs: 3,
                                    targets: {
                                        browsers: [
                                            'Chrome >= 60',
                                            'Safari >= 10.1',
                                            'iOS >= 10.3',
                                            'Firefox >= 54',
                                            'Edge >= 15',
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

module.exports = es2015;