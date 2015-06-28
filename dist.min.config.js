module.exports = {
  context: __dirname + '/src',
  entry: {
    'alt': ['./alt/index.js'],
    'alt-with-addons': ['./alt/addons.js']
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
  externals: {
    'react': 'react'
  }
};
