module.exports = {
  context: __dirname + '/src',
  mode: 'production',
  entry: {
    'alt': ['./index.js'],
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].min.js',
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
