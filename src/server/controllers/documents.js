import express from "express"

import { sendSuccess, sendError } from "../response"
import ownerHelper from "../helpers/owners"
import { SSJWarning } from "../errors"

const router = express.Router()

/**
 * POST JSON data format:
 *
 * {
 *    "templateIds": ["<<TEMPLATE_ID>>"],
 *    "schoolIds":   ["<<SCHOOL_ID>>"]
 *    "teacherIds":  ["<<TEACHER_ID>>"]
 *  }
 */
router.post("/copy", async (req, res) => {
  const schoolIds = req.body.schoolIds || [],
    teacherIds = req.body.teacherIds || [],
    templateIds = req.body.templateIds

  if (
    !templateIds ||
    !templateIds.length ||
    (!schoolIds.length && !teacherIds.length)
  ) {
    sendSuccess(res)
    return
  }

  // "wait" will hold a list of promises, will use w/ Promise.all to block until all copy operations finished
  let wait = []

  const getOwnerList = () => {
    const schools = schoolIds.map(schoolId => {
      return {
        type: "School",
        id: schoolId
      }
    })
    const teachers = teacherIds.map(teacherId => {
      return {
        type: "Teacher",
        id: teacherId
      }
    })
    return schools.concat(teachers)
  }
  const owners = getOwnerList()
  if (!owners) {
    sendSuccess(res)
    return
  }

  // Verify all owners have a driveFolder assigned
  await Promise.all(
    owners.map(async owner => {
      await ownerHelper.generateDriveFolderForOwner(owner.id, owner.type)
    })
  ).catch(err => {
    sendError(res, 500, "Unexpected Error", err.message)
    throw err
  })

  for (const templateId of templateIds) {
    for (const owner of owners) {
      wait.push(
        (async () => {
          console.log(
            `TemplateId: ${templateId}, OwnerId: ${owner.id} - Starting copy request...`
          )

          try {
            await ownerHelper.createDocumentForOwnerFromTemplate(
              owner.id,
              owner.type,
              templateId
            )
          } catch (err) {
            if (err instanceof SSJWarning) {
              console.log(
                `TemplateId: ${templateId}, OwnerId: ${owner.id} - Caught SSJWarning, continuing copy: ${err.message}`
              )
            } else {
              console.log(
                `TemplateId: ${templateId}, OwnerId: ${owner.id} - Unexpected Error: ${err.message}`
              )
              sendError(res, 500, "Unexpected Error", err.message)
              throw err
            }
          } finally {
            console.log(
              `TemplateId: ${templateId}, OwnerId: ${owner.id} - Finished`
            )
          }
        })()
      )
    }
  }

  Promise.all(wait)
    .then(() => {
      sendSuccess(res)
    })
    .catch(err => {
      console.log(err)
    })
})

export default router
