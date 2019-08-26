import express from "express"

import { SSJError } from "../errors"
import { sendSuccess, sendError } from "../response"
import { firebase } from "../util/Firebase"
import ownerHelper from "../helpers/owners"
import schoolModel from "../models/school"

const router = express.Router()

router.post("/:schoolId/generate_drive_folder", async (req, res) => {
  const schoolId = req.params.schoolId

  if (!schoolId) {
    sendError(res, 422, "Unprocessable Entity", "Missing school ID")
    return
  }

  const ref = firebase.school(schoolId)
  try {
    await ownerHelper.generateDriveFolderForOwner(ref, "school")
    sendSuccess(res)
  } catch (e) {
    if (e instanceof SSJError) {
      sendError(res, e.httpCode, e.title, e.message)
    } else {
      sendError(res, 500, "Unexpected Error", e.message)
    }
    console.error(e)
  }
})

/**
 * POST JSON data format:
 *
 * {
 *    "fileId": "<<file_id>>",
 *    "name":   "<<name>>"
 *  }
 */
router.post("/:schoolId/upload", async (req, res) => {
  const schoolId = req.params.schoolId,
    fileId = req.body.fileId,
    name = req.body.name

  if (!schoolId) {
    sendError(res, 422, "Unprocessable Entity", "Missing school ID")
    return
  }
  if (!fileId) {
    sendError(res, 422, "Unprocessable Entity", "Missing fileId")
    return
  }
  if (!name) {
    sendError(res, 422, "Unprocessable Entity", "Missing name")
    return
  }

  try {
    await ownerHelper.createDocumentForOwnerFromFile(
      schoolId,
      "school",
      fileId,
      name
    )
    sendSuccess(res)
  } catch (e) {
    if (e instanceof SSJError) {
      sendError(res, e.httpCode, e.title, e.message)
    } else {
      sendError(res, 500, "Unexpected Error", e.message)
    }
    console.error(e)
  }
})

export default router
