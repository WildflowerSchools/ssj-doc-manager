const express = require('express')
const path = require('path')

const app = express()

app.use(express.static('dist'))

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/dist/index.html'))
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
