var path = require('path');
var webpack = require('webpack');
var env = process.env.WEBPACK_ENV;

module.exports = {
  entry: [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: env == 'dist' ? 'aphrodite.min.js' : 'aphrodite.js',
    libraryTarget: "umd"
  },
  plugins: env == 'dist' ? [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ] : [],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    }]
  }
}