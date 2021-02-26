module.exports = {
  context: __dirname + '/src',
  mode: 'none',
  entry: {
    'alt': ['./index.js'],
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    library: 'Alt',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }]
  },
};
