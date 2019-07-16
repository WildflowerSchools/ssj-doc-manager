import express from "express"
import path from "path"

import { firebase } from "./Firebase"
import { gClient } from "./Google"
;(async () => {
  try {
    let success = await gClient.authorize()
    if (!success) {
      console.error(
        "Unable to authorize Google Service Client, please make sure you've supplied a valid serviceAccountKey.json"
      )
      process.exit(0)
    }

    const app = express()
    const STATIC_FILE_PATH = path.join(__dirname, "../../dist")

    app.use(express.static(STATIC_FILE_PATH))
    app.use(express.json())

    const sendSuccess = (res, jsonData = {}) => {
      res.json(jsonData)
    }

    const sendError = (res, httpCode, errTitle, errDetail) => {
      res.status(httpCode)
      res.json({
        title: errTitle,
        detail: errDetail,
        status: httpCode
      })
    }

    app.get("*", (req, res) => {
      res.sendFile(path.join(STATIC_FILE_PATH, "index.html"))
    })

    /**
     * Create a Google Drive folder for a given school or teacher. Will not generate a Drive folder if one already exists.
     *
     * @param res
     * @param ownerRef
     * @param ownerType
     */
    const generateDriveFolderForOwner = (res, ownerRef, ownerType) => {
      ownerRef
        .get()
        .then(ownerSnapshot => {
          if (!ownerSnapshot.exists) {
            sendError(
              res,
              404,
              `No ${ownerType.toLowerCase()} found`,
              `Unable to find ${ownerType.toLowerCase()} record '${ownerRef.id}`
            )
            throw `No ${ownerType.toLowerCase()} found '${ownerRef.id}'`
          }

          const owner = {
            ...ownerSnapshot.data(),
            ...{ id: ownerSnapshot.id }
          }

          if (owner.drive_folder) {
            sendSuccess(res)
            throw `${ownerType.toLowerCase()} Drive folder already exists '${
              owner.id
            }': ${JSON.stringify(owner.drive_folder)}`
          }

          return gClient.driveManager.createRootFolder(owner.id)
        })
        .then((driveFolder, err) => {
          if (err) {
            sendError(
              res,
              500,
              "Unable to create Drive folder",
              `Failed generating a Drive folder for ${ownerType.toLowerCase()} '${
                owner.id
              }': ${err}`
            )
            throw `Unable to create Drive folder for ${ownerType.toLowerCase()} ${
              owner.id
            }`
          }

          return ownerRef.update({
            drive_folder: {
              id: driveFolder.id,
              webViewLink: driveFolder.webViewLink
            }
          })
        })
        .then(() => {
          sendSuccess(res)
        })
        .catch(err => {
          console.error(err)
        })
    }
    app.post("/teachers/:teacher_id/generate_drive_folder", (req, res) => {
      const ref = firebase.teacher(req.params.teacher_id)
      return generateDriveFolderForOwner(res, ref, "teacher")
    })

    app.post("/schools/:school_id/generate_drive_folder", (req, res) => {
      const ref = firebase.school(req.params.school_id)
      return generateDriveFolderForOwner(res, ref, "school")
    })

    /**
     * POST JSON data format:
     *
     * {
     *    "templateIds": ["<<TEMPLATE_ID>>"],
     *    "schoolIds":   ["<<SCHOOL_ID>>"]
     *    "teacherIds":  ["<<TEACHER_ID>>"]
     *  }
     */
    app.post("/documents/copy", (req, res) => {
      // TODO: validate request's body object

      let wait = []

      if (!req.body.templateIds || !req.body.templateIds.length) {
        sendSuccess(res)
        return
      }

      req.body.templateIds.forEach(templateId => {
        let owners = []
        if (req.body.schoolIds) {
          owners = owners.concat(
            req.body.schoolIds.map(schoolId => {
              return {
                ownerRef: firebase.school(schoolId),
                ownerType: "School",
                ownerId: schoolId
              }
            })
          )
        }

        if (req.body.teacherIds) {
          owners = owners.concat(
            req.body.teacherIds.map(teacherId => {
              return {
                ownerRef: firebase.teacher(teacherId),
                ownerType: "Teacher",
                ownerId: teacherId
              }
            })
          )
        }

        const templateRef = firebase.template_document(templateId)
        templateRef.get().then(templateSnapshot => {
          const template = {
            ...templateSnapshot.data(),
            ...{ id: templateSnapshot.id }
          }

          owners.forEach(o => {
            wait.push(
              new Promise(resolve => {
                class BreakChain extends Error {}

                const ownerRef = o.ownerRef

                // Fetch firestore data
                ownerRef
                  .get()
                  .then(ownerSnapshot => {
                    const owner = {
                      ...ownerSnapshot.data(),
                      ...{ id: ownerSnapshot.id }
                    }

                    // Avoid creating multiple copies of the same file per owner
                    const templateIds = template.documents
                        ? template.documents.map(td => td.id)
                        : [],
                      ownerDocumentIds = owner.documents
                        ? owner.documents.map(d => d.id)
                        : [],
                      intersection = templateIds.filter(tid =>
                        ownerDocumentIds.includes(tid)
                      )
                    if (intersection && intersection.length) {
                      const msg = `Skipping file ${template.document_name} for ${owner.name}, file already exists`
                      throw new BreakChain(msg)
                    }

                    if (!owner.drive_folder || !owner.drive_folder.id) {
                      const msg = `Could not copy files because the ${o.ownerType.toLowerCase()} '${
                        owner.id
                      }' does not have a Drive folder assigned`
                      throw new BreakChain(msg)
                    }

                    return owner
                  })
                  // Create copy of Google Doc in user's Drive folder
                  .then(owner => {
                    const docUrl = new URL(template.document_url)

                    /* We want to strip the Drive ID from the Drive URL, but Drive URLs comes in two forms:
                     * https://drive.google.com/open?id=<<ID>>
                     * https://docs.google.com/document/d/<<ID>>/edit?usp=sharing
                     */
                    let docId = docUrl.searchParams.get("id")
                    if (!docId) {
                      docId = template.document_url.match(/\/d\/(.{25,})\//)[1]
                    }

                    return gClient.driveManager
                      .copyFileIntoDestinationFolder(
                        docId,
                        owner.drive_folder.id,
                        template.document_name
                      )
                      .then(newFile => {
                        return newFile
                      })
                      .catch(err => {
                        //sendError(res, 500, "Unable to copy Drive file", "Failed copying the file, please try again")
                        console.log(err.message)
                        const msg = `Unable to copy Drive file - Failed copying the file '${template.document_name}', please try again`
                        throw new BreakChain(msg)
                      })
                  })
                  .then(newFile => {
                    // Create the new document in Firestore
                    let newDocument = Object.assign(
                      {
                        owner: ownerRef,
                        template_document: templateRef
                      },
                      template
                    )
                    // The template that's copied has a "documents" array attribute that should be removed
                    delete newDocument["documents"]
                    newDocument.document_url = newFile.webViewLink

                    // Create new document
                    return firebase.documents().add(newDocument)
                  })
                  .then(documentRef => {
                    // Update template document and owner (teacher/school object) to include links to the new document copy
                    templateRef.update({
                      documents: firebase.firestoreNS.FieldValue.arrayUnion(
                        documentRef
                      )
                    })
                    ownerRef.update({
                      documents: firebase.firestoreNS.FieldValue.arrayUnion(
                        documentRef
                      )
                    })
                  })
                  .catch(e => {
                    if (e instanceof BreakChain) {
                      console.log(e.message)
                      resolve()
                    } else {
                      sendError(res, 500, "Unexpected Error", e.message)
                    }
                  })
                  .finally(() => {
                    resolve()
                  })
              })
            )
          })

          Promise.all(wait)
            .then(() => {
              sendSuccess(res)
            })
            .catch(err => {
              console.log(err)
            })
        })
      })
    })

    const listener = app.listen(process.env.PORT || 3000, function() {
      console.log("Your app is listening on port " + listener.address().port)
    })
  } catch (e) {
    console.error(e)
    process.exit(0)
  }
})()
