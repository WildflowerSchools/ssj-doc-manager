import express from "express"

import { SSJError } from "../errors"
import { sendSuccess, sendError } from "../response"
import { firebase } from "../util/Firebase"
import ownerHelper from "../helpers/owners"
import teacherModel from "../models/teacher"

const router = express.Router()

router.post("/:teacher_id/generate_drive_folder", async (req, res) => {
  const ref = firebase.teacher(req.params.teacher_id)
  try {
    await ownerHelper.generateDriveFolderForOwner(ref, "teacher")
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
router.post("/:teacherId/upload", async (req, res) => {
  const teacherId = req.params.teacherId,
    fileId = req.body.fileId,
    name = req.body.name

  if (!teacherId) {
    sendError(res, 422, "Unprocessable Entity", "Missing teacher ID")
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
      teacherId,
      "teacher",
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
