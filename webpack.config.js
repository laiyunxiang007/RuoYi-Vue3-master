const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin')
const {VueLoaderPlugin} =require('vue-loader');
const ScriptExtHtmlWebpackPlugin=require('script-ext-html-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
function resolve(dir) {
    return path.join(__dirname, dir)
}
const port = process.env.port || process.env.npm_config_port || 80 // 端口
module.exports={
    mode: "production",
    entry: './src/main.js',
    performance: {
        //入口起点的最大体积
        maxEntrypointSize: 50000000,
        //生成文件的最大体积
        maxAssetSize: 30000000,
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './'),
            '@': path.resolve(__dirname, './src')
        },
        extensions: [
            '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue','.svg'
        ]
    },
    devServer: {
        host: '0.0.0.0',
        port: port,
        open: true,
        proxy: {
            // detail: https://cli.vuejs.org/config/#devserver-proxy
            [process.env.VUE_APP_BASE_API]: {
                target: `http://localhost:8070`,
                changeOrigin: true,
                pathRewrite: {
                    ['^' + process.env.VUE_APP_BASE_API]: ''
                }
            }
        },
        disableHostCheck: true
    },
    module: {
        rules: [
            {test: /\.svg$/, loader: 'svg-sprite-loader', include: resolve('src/assets/icons'),
                options: {symbolId: 'icon-[name]'}},
            {test: /\.svg$/, loader: 'svg-sprite-loader', include: resolve('src/assets/images'),
                options: {symbolId: 'icon-[name]'}},
            {test: /\.scss$/,use: ['style-loader','css-loader','sass-loader']},
            {test: /\.css$/,use: ['style-loader','css-loader','sass-loader']},
            {test: /\.(png|jpg|gif)$/, loader: 'url-loader', options: { limit: 50000000 }},
            {test: /\.vue$/,loader: 'vue-loader',
                exclude: file => ( /node_modules/.test(file) && !/\.vue\.js/.test(file))
            },
        ],
    },
    plugins: [
        new CompressionPlugin({
            test: /\.(js|css|html)?$/i,     // 压缩文件格式
            filename: '[path][base].gz',   // 压缩后的文件名
            algorithm: 'gzip',              // 使用gzip压缩
            minRatio: 0.8                   // 压缩率小于1才会压缩
        }),
        new VueLoaderPlugin(),
        new ScriptExtHtmlWebpackPlugin({
            inline: /runtime\..*\.js$/,
        }),
    ],
    optimization: {
        splitChunks:{
            chunks: 'all',
            cacheGroups: {
                libs: {
                    name: 'chunk-libs',
                    test: /[\\/]node_modules[\\/]/,
                    priority: 10,
                    chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                    name: 'chunk-elementUI', // split elementUI into a single package
                    priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                    test: /[\\/]node_modules[\\/]_?element-plus(.*)/ // in order to adapt to cnpm
                },
                commons: {
                    name: 'chunk-commons',
                    test: resolve('src/components'), // can customize your rules
                    minChunks: 3, //  minimum common number
                    priority: 5,
                    reuseExistingChunk: true
                }
            }
        },
        runtimeChunk: true

    }
}