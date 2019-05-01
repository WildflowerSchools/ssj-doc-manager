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
  
  let conf = {
    mode: 'development',
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
  
  let production = options.mode === 'production'
	conf.devtool = production ? false : 'eval-source-map'
	return conf
}
