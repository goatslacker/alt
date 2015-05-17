var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: path.join(__dirname, 'scripts', 'search.js'),
  output: {
    filename: path.join(__dirname, 'assets', 'search.js')
  },
  module: {
    loaders: [
      { test: /\.js$/,
        include: [
          path.join(__dirname, 'scripts'),
          path.join(__dirname, '..', 'node_modules', 'alt-search-docs', 'src'),
          path.join(__dirname, '..', 'node_modules', 'alt-search-docs', 'node_modules/react-text-highlight/src'),
        ],
        loader: 'babel-loader?stage=0'
      },
      { test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
}
