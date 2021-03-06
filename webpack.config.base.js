const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

var config = {

  entry: {
    'index': ['./src/js/index.js', './src/css/index.scss'],
    'confirm': ['./src/js/confirm.js', './src/css/confirm.scss'],
    'detail': ['./src/js/detail.js', './src/css/detail.scss'],
    'my': ['./src/js/my.js', './src/css/my.scss'],
    'order': ['./src/js/order.js', './src/css/order.scss'],
    'order_detail': ['./src/js/order_detail.js', './src/css/confirm.scss'],
    'seller': ['./src/js/seller.js', './src/css/seller.scss'],
    'login': ['./src/js/login.js', './src/css/login.scss'],
    'common': ['./src/js/main.js', './src/css/main.scss'],
  },

  output: {
    filename: 'js/[name].[hash:8].js',
    publicPath: '/',
    // publicPath: 'http://abc.com/static/'
    path: path.resolve(__dirname, 'dist') // 输出文件目录
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ['css-loader?minimize=true', 'autoprefixer-loader']
        })
      }, {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ['css-loader?minimize=true', 'autoprefixer-loader', 'sass-loader']
        })
      }, {
        test: /\.js$/,
        use: ['babel-loader?presets[]=env']
      }, {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: ['url-loader?limit=8192&name=images/[name].[hash:8].[ext]']
      }, {
        test: /\.(woff|eot|ttf|svg)$/,
        use: ['url-loader?name=css/[name].[hash:8].[ext]']
      }, {
        test: /\.tpl$/,
        use: ['html-loader']
      // }, {
      //   test: /\.html$/,
      //   use: ['html-loader?minimize=true']
      }
    ]
  },

  externals: {
    "jquery": 'window.$',
  },

  plugins: [
    new ExtractTextPlugin('css/[name].[hash:8].css'),
    new webpack.optimize.CommonsChunkPlugin({name: 'common'}),
    new webpack.optimize.OccurrenceOrderPlugin()
  ]

}

module.exports = config;