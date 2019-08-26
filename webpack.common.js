const CopyWebpackPlugin = require('copy-webpack-plugin')
const dotenv = require('dotenv')
const webpack = require('webpack')

module.exports = (() => {
  const validEnvKeys = [
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_DATABASE_URL',
    'FIREBASE_API_KEY',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_PROJECT_ID'
  ]

  const dotenv_parsed = dotenv.config().parsed || {}

  const envKeys = validEnvKeys.reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(dotenv_parsed[next] || process.env[next])
    return prev
  }, {})

  return {
    entry: './src/client/index.js',
    module: {
      rules: [
        {
          test: /\.js$/,
          include: /src\/client/,
          exclude: /node_modules/,
          loader: "babel-loader",
          query: {
            cacheDirectory: true,
            cacheCompression: false
          }
        },
        {
          test: /\.(css|less)$/,
          loader: [ 'style-loader', 'css-loader' ]
        }
      ]
    },
    optimization: {
      usedExports: true,
      sideEffects: true
    },
    plugins: [
      /* Supply env vars to react scripts */
      new webpack.DefinePlugin(envKeys),
      /* Copy files from src to dist */
      new CopyWebpackPlugin([
        './src/client/index.html',
        './src/client/style.css',
        {from: './src/client/favicon/*', flatten: true}
        /* Add an additional files to copy to dist here */
      ])
    ]
  }
})()
