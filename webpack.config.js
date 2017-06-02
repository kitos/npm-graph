const path = require('path')
const webpack = require('webpack')

module.exports = {

    entry: './src/index.js',

    output: {
        path: path.resolve('./public'),
        filename: 'bundle.js',
    },

    module: {

        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            }
        ],
    },

    plugins:[
        new webpack.optimize.UglifyJsPlugin()
    ]
}
