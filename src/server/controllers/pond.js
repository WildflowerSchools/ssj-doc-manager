import express from "express"
import multer from "multer"

import config from "../config"
import pondHelper from "../helpers/pond"
import { sendError } from "../response"

const router = express.Router(),
  upload = multer({ dest: config.UPLOAD_PATH })

router.post("/", upload.single("file"), async (req, res) => {
  console.log(`File upload staged new file: ${JSON.stringify(req.file)}`)
  res.send(req.file.filename)
})

router.delete("/", async (req, res) => {
  if (!req.body || req.body.length === 0) {
    sendError(res, 404)
    return
  }

  const fileId = req.body

  const filePath = pondHelper.getFilePath(fileId)
  if (!filePath) {
    sendError(res, 404)
    return
  }

  try {
    pondHelper.unlinkFile(fileId)
    console.log(`File un-staged: ${JSON.stringify(filePath)}`)
    res.send()
  } catch (err) {
    console.error(err)
    sendError(res, 500, "Unexpected Error")
  }
})

export default router
