module.exports = {
  context: __dirname + '/src',
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
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }]
  },
};
