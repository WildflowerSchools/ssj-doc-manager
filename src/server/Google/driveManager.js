import { google } from "googleapis"

class GDriveManager {
  constructor() {
    this.drive = google.drive("v3")
  }

  async createRootFolder(id) {
    const fileMetadata = {
      name: id,
      mimeType: "application/vnd.google-apps.folder"
    }
    let createPromise = new Promise((resolve, reject) => {
      return this.drive.files
        .create({
          resource: fileMetadata,
          fields: "id, webViewLink"
        })
        .then((response, err) => {
          if (err) {
            reject(err)
          } else {
            resolve(response.data)
          }
        })
        .catch(error => reject(error))
    })

    let driveFolder = await createPromise
    return driveFolder
  }

  copyFileIntoDestinationFolder(fileId, folderDestinationId, name) {
    return new Promise((resolve, reject) => {
      return this.drive.files
        .copy({
          fileId: fileId,
          fields: "id, webViewLink, name",
          resource: {
            name: name,
            parents: [folderDestinationId]
          }
        })
        .then((response, err) => {
          if (err) {
            reject(err)
          } else {
            const newFile = response.data

            this.drive.permissions
              .create({
                fileId: newFile.id,
                fields: "id",
                sendNotificationEmails: false,
                resource: {
                  type: "anyone",
                  role: "writer",
                  allowFileDiscovery: false
                }
              })
              .then((pResponse, pErr) => {
                if (pErr) {
                  reject(pErr)
                } else {
                  resolve(newFile)
                }
              })
              .catch(error => reject(error))
          }
        })
        .catch(error => reject(error))
    })
  }
}

export default GDriveManager
