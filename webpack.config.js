const path = require('path')
const webpack = require('webpack')

module.exports = {

    entry: {
        vendor: [
            'vis',
            'ramda',
            'rx-lite-dom-events',
            'normalizr'
        ],
        main: './src/index.js',
    },

    output: {
        path: path.resolve('./public'),
        filename: '[name].bundle.js',
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
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        })
    ]
}
