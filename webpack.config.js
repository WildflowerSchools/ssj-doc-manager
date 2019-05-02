const CopyWebpackPlugin = require('copy-webpack-plugin')
const dotenv = require('dotenv')
const webpack = require('webpack')


module.exports = () => {
  const env = dotenv.config().parsed;
  const mode = env['ENVIRONMENT'] || 'development'
  const sourceMap = false // 'eval-source-map'
  
  // reduce it to a nice object, the same as before
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});
  
  return {
    mode: mode,
    devtool: mode === 'production' ? false : sourceMap,
    // devServer: {
    //   /*port: 80,
    //   public: 'messy-cart.glitch.me'*/
    //   hot: true,
    //   inline: true
    // },
    // output: {
    //     filename: '[name].js',
    //     publicPath: 'http://localhost:3000/assets',
    //     path: '/',
    // },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          query: {
            cacheDirectory: true
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
}
