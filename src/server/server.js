import express from "express"
import path from "path"

import { firebase } from "./Firebase"
import { gClient } from "./Google"
import { SSJError, SSJWarning } from "./errors"
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
    const generateDriveFolderForOwner = async (ownerRef, ownerType) => {
      console.log(
        `Attempting to generate a drive folder for ${ownerType}: ${ownerRef.id}`
      )

      const ownerSnapshot = await ownerRef.get()
      if (!ownerSnapshot.exists) {
        throw new SSJError(
          `No ${ownerType.toLowerCase()} found`,
          404,
          `Unable to find ${ownerType.toLowerCase()} record '${ownerRef.id}`
        )
      }

      const owner = {
        ...ownerSnapshot.data(),
        ...{ id: ownerSnapshot.id }
      }

      if (owner.drive_folder && owner.drive_folder.id) {
        console.log(
          `Drive folder already exists for ${ownerType}: ${
            owner.id
          } - ${JSON.stringify(owner.drive_folder)}`
        )
        return
      }

      let driveFolder
      try {
        driveFolder = await gClient.driveManager.createRootFolder(owner.id)
      } catch (err) {
        throw new SSJError(
          "Unable to create Drive folder",
          500,
          `Failed generating a Drive folder for ${ownerType.toLowerCase()} '${
            owner.id
          }': ${err}`
        )
      }

      console.log(
        `Generated a new drive folder for ${ownerType}: ${
          owner.id
        } - ${JSON.stringify(owner.drive_folder)}`
      )
      await ownerRef.update({
        drive_folder: {
          id: driveFolder.id,
          webViewLink: driveFolder.webViewLink
        }
      })
    }

    app.post(
      "/teachers/:teacher_id/generate_drive_folder",
      async (req, res) => {
        const ref = firebase.teacher(req.params.teacher_id)
        try {
          await generateDriveFolderForOwner(ref, "teacher")
          sendSuccess(res)
        } catch (e) {
          if (e instanceof SSJError) {
            sendError(res, e.httpCode, e.title, e.message)
          } else {
            sendError(res, 500, "Unexpected Error", e.message)
          }
          console.error(e)
        }
      }
    )

    app.post("/schools/:school_id/generate_drive_folder", async (req, res) => {
      const ref = firebase.school(req.params.school_id)
      try {
        await generateDriveFolderForOwner(ref, "school")
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
     *    "templateIds": ["<<TEMPLATE_ID>>"],
     *    "schoolIds":   ["<<SCHOOL_ID>>"]
     *    "teacherIds":  ["<<TEACHER_ID>>"]
     *  }
     */
    app.post("/documents/copy", async (req, res) => {
      // TODO: validate request's body object

      // "wait" will hold a list of promises, will use w/ Promise.all to block until all copy operations finished
      let wait = []

      if (!req.body.templateIds || !req.body.templateIds.length) {
        sendSuccess(res)
        return
      }

      let owners = []
      if (req.body.schoolIds) {
        owners = owners.concat(
          req.body.schoolIds.map(schoolId => {
            return {
              ref: firebase.school(schoolId),
              type: "School",
              id: schoolId,
              remoteData: null
            }
          })
        )
      }

      if (req.body.teacherIds) {
        owners = owners.concat(
          req.body.teacherIds.map(teacherId => {
            return {
              ref: firebase.teacher(teacherId),
              type: "Teacher",
              id: teacherId,
              remoteData: null
            }
          })
        )
      }

      for (const owner of owners) {
        const ownerSnapshot = await owner.ref.get()
        owner.remoteData = {
          ...ownerSnapshot.data(),
          ...{ id: ownerSnapshot.id }
        }
      }

      try {
        for (const owner of owners) {
          if (
            !owner.remoteData.drive_folder ||
            !owner.remoteData.drive_folder.id
          ) {
            // Attempt to generate a drive folder if one is missing
            await generateDriveFolderForOwner(owner.ref, owner.type)

            // Reload owner data after generating a drive folder
            const ownerSnapshot = await owner.ref.get()
            owner.remoteData = {
              ...ownerSnapshot.data(),
              ...{ id: ownerSnapshot.id }
            }
          }
        }
      } catch (e) {
        if (e instanceof SSJError) {
          sendError(res, e.httpCode, e.title, e.message)
        } else {
          sendError(res, 500, "Unexpected Error", e.message)
        }
        console.error(e)
        return
      }

      for (const templateId of req.body.templateIds) {
        const templateRef = firebase.template_document(templateId),
          templateSnapshot = await templateRef.get(),
          template = {
            ...templateSnapshot.data(),
            ...{ id: templateSnapshot.id }
          }

        for (const owner of owners) {
          wait.push(
            new Promise(resolve => {
              console.log(
                `TemplateId: ${template.id}, OwnerId: ${
                  owner.id
                } - Starting copy request of ${template.document_name} for ${
                  owner.remoteData.name
                }...`
              )
              class BreakChain extends Error {}

              // Avoid replicating the same document multiple time for a give owner
              const templateIds = template.documents
                  ? template.documents.map(td => td.id)
                  : [],
                ownerDocumentIds = owner.remoteData.documents
                  ? owner.remoteData.documents.map(d => d.id)
                  : [],
                intersection = templateIds.filter(tid =>
                  ownerDocumentIds.includes(tid)
                )
              if (intersection && intersection.length) {
                const msg = `TemplateId: ${template.id}, OwnerId: ${
                  owner.id
                } - Skipping, copy already exists`
                throw new BreakChain(msg)
              }

              // Create copy of Google Doc in user's Drive folder
              const docUrl = new URL(template.document_url)
              /* We want to strip the Drive ID from the Drive URL, but Drive URLs comes in two forms:
               * https://drive.google.com/open?id=<<ID>>
               * https://docs.google.com/document/d/<<ID>>/edit?usp=sharing
               */
              let docId = docUrl.searchParams.get("id")
              if (!docId) {
                docId = template.document_url.match(/\/d\/(.{25,})\//)[1]
              }

              gClient.driveManager
                .copyFileIntoDestinationFolder(
                  docId,
                  owner.remoteData.drive_folder.id,
                  template.document_name
                )
                .then(newFile => {
                  ;`TemplateId: ${template.id}, OwnerId: ${
                    owner.id
                  } - Successfully created copy -> ${newFile.id}: ${
                    newFile.name
                  }`
                  return newFile
                })
                .catch(err => {
                  console.error(err.message)
                  const msg = `TemplateId: ${template.id}, OwnerId: ${
                    owner.id
                  } - Unable to copy Drive file, please try again`
                  throw new BreakChain(msg)
                })

                // The document has been copied into GDrive, now store a record of the new document in Firestore
                .then(newFile => {
                  console.log(
                    `TemplateId: ${template.id}, OwnerId: ${
                      owner.id
                    }, NewFileId: ${
                      newFile.id
                    } - Saving record of new file in firestore...`
                  )

                  let newDocument = Object.assign(
                    {
                      owner: owner.ref,
                      template_document: templateRef
                    },
                    template
                  )
                  // The template that's copied has a "documents" array attribute that should be removed
                  delete newDocument["documents"]
                  newDocument.document_url = newFile.webViewLink

                  // Create new document
                  return firebase
                    .documents()
                    .add(newDocument)
                    .then(documentRef => {
                      return [newFile, documentRef]
                    })
                    .catch(err => {
                      const msg = `TemplateId: ${template.id}, OwnerId: ${
                        owner.id
                      }, NewFileId: ${
                        newFile.id
                      } - Unable to store new document record in Firestore, please try again`
                      throw new BreakChain(msg)
                    })
                })

                // Update template document object and owner (teacher/school object) to include links to the new document copy
                .then(args => {
                  const [newFile, documentRef] = args
                  console.log(
                    `TemplateId: ${template.id}, OwnerId: ${
                      owner.id
                    }, NewFileId: ${
                      newFile.id
                    } - Storing references in Firestore to new document record...`
                  )

                  templateRef.update({
                    documents: firebase.firestoreNS.FieldValue.arrayUnion(
                      documentRef
                    )
                  })
                  owner.ref.update({
                    documents: firebase.firestoreNS.FieldValue.arrayUnion(
                      documentRef
                    )
                  })
                })
                .catch(e => {
                  console.log(e.message)
                  if (!(e instanceof BreakChain)) {
                    sendError(res, 500, "Unexpected Error", e.message)
                  }
                })
                .finally(() => {
                  console.log(
                    `TemplateId: ${template.id}, OwnerId: ${
                      owner.id
                    } - Finished`
                  )
                  resolve()
                })
            })
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

    const listener = app.listen(process.env.PORT || 3000, function() {
      console.log("Your app is listening on port " + listener.address().port)
    })
  } catch (e) {
    console.error(e)
    process.exit(0)
  }
})()
