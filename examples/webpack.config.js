module.exports = {
    mode: "development",
    target: "web",
    output: {
        path: __dirname + '/',
        filename: 'bundle.js'
    },
    entry: {
        index: './src/examples'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
        ]
    },
};
