import bodyParser from "body-parser"
import express from "express"
import path from "path"

import config from "./config"
import controllers from "./controllers"
import { gClient } from "./util/Google"
;(async () => {
  try {
    const success = await gClient.authorize()
    if (!success) {
      console.error(
        "Unable to authorize Google Service Client, please make sure you've supplied a valid serviceAccountKey.json"
      )
      process.exit(0)
    }

    const app = express()

    app.use(express.static(config.STATIC_FILE_PATH))
    app.use(express.json())
    app.use(bodyParser.text())

    app.get("*", (req, res) => {
      res.sendFile(path.join(config.STATIC_FILE_PATH, "index.html"))
    })

    app.use(controllers)

    const listener = app.listen(config.PORT, function() {
      console.log("Your app is listening on port " + listener.address().port)
    })
  } catch (e) {
    console.error(e)
    process.exit(0)
  }
})()
