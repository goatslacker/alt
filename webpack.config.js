var webpack = require('webpack');
var production = process.env.NODE_ENV === 'production';

function getPlugins(production) {
  var plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
  ];

  if (production) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {warnings: false}
      })
    );
  }

  return plugins;
}

function getOutputFilename(production) {
  var outputFilename = '';
  if (production) {
    outputFilename = '[name].min.js';
  } else {
    outputFilename = '[name].js';
  }

  return outputFilename;
}

module.exports = {
  context: __dirname + '/src',
  entry: {
    alt: ['./alt/index.js'],
    'alt-with-addons': ['./alt/addons.js']
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  output: {
    path: __dirname + '/dist',
    filename: getOutputFilename(production),
    libraryTarget: 'umd',
    library: 'alt'
  },
  externals: [
    {
      "react": {
        root: "React",
        commonjs2: "react",
        commonjs: "react",
        amd: "react"
      }
    }
  ],
  plugins: getPlugins(production)
};
