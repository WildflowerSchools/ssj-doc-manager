require("@babel/register")({
  presets: ["@babel/preset-env"]
})

// App runs on Glitch for testing, Glitch doesn't handle env vars with double quotes the same as dotenv does.
// When onGlitch(), override the env vars that Glitch loads with dotenv's formatting
// There's no great way to check if on Glitch, using a Glitch specific env var: https://support.glitch.com/t/detect-if-app-is-running-on-glitch/3120
const onGlitch = () => { return process.env.PROJECT_REMIX_CHAIN }

if (onGlitch()) {
  const fs = require('fs')
  const dotenv = require('dotenv')
  const envConfig = dotenv.parse(fs.readFileSync('.env'))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }
} else {
  require("dotenv").config()
}

module.exports = require("./server.js")
