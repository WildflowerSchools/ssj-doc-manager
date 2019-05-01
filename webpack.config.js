const CopyWebpackPlugin = require('copy-webpack-plugin')
const dotenv = require('dotenv');
const webpack = require('webpack');


module.exports = () => {
  const env = dotenv.config().parsed;
  
  // reduce it to a nice object, the same as before
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});
  
  return {
    mode: 'development',
    devtool: 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    },
    output: {
      sourceMapFilename: 'dist/src.js.map'
    }
    plugins: [
      /* Supply env vars to react scripts */
      new webpack.DefinePlugin(envKeys),
      /* Copy files from src to dist */
      new CopyWebpackPlugin([ 
        './src/index.html',
        './src/style.css',
        /* Add an additional files to copy to dist here */
      ])
    ]
  }
}
