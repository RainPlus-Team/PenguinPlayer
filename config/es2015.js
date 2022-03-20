const es2015 = {
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