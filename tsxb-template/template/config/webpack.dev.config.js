const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const paths = require('../paths.js');

module.exports = {
    mode: 'development',
    entry: paths.appEntry,
    output: {
        path: paths.appBuild,
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: false,
                        configFile: paths.devConfig.tsconfigJson,
                    },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            // {
            //     test: /\.scss$/,
            //     use: ['style-loader', 'css-loader', 'sass-loader'],
            // },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: paths.appIndexHtml,
        }),
    ],
    devServer: {
        static: {
            directory: paths.appStatic,
        },
        port: 9000,
        // historyApiFallback: true,
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:3000',
        //         pathRewrite: {
        //             '^/api': '/api',
        //         },
        //     },
        // },
    },

}