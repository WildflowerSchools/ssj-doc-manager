require("@babel/register")({
  presets: ["@babel/preset-env"]
})
require("dotenv").config() 

module.exports = require("./server.js")
