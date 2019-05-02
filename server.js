const express = require('express')
const path = require('path')
/*const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');*/

const app = express()

app.use(express.static('dist'))

/*
// Configuring webpack 
const config = require('./webpack.config')
const compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {colors: true}
}))
*/

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/dist/index.html'))
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
