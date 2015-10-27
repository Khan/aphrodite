var path = require('path');

module.exports = {
  entry: [
    './src/examples'
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/
    }]
  }
}
