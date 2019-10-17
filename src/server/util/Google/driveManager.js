import fs from "fs"
import { google } from "googleapis"
import { getMimeType } from "./util"

class GDriveManager {
  constructor() {
    this.drive = google.drive("v3")
  }

  async createRootFolder(id) {
    console.log(`Creating drive folder for owner id ${id}`)
    const fileMetadata = {
      name: id,
      mimeType: "application/vnd.google-apps.folder"
    }
    const driveFolder = await new Promise((resolve, reject) => {
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

    return driveFolder
  }

  /**
   * Will grant edit privileges on given fileId
   *
   * @param emails
   * @returns {Promise<void>}
   */
  async addEditPrivilege(fileId, emails) {
    const permissions = await new Promise((resolve, reject) => {
      return this.drive.permissions
        .create({
          fileId: fileId,
          fields: "id",
          sendNotificationEmails: false,
          resource: {
            type: "user",
            role: "writer",
            allowFileDiscovery: false,
            emailAddress:
          }
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

    return permissions
  }

  /**
   * Will remove edit privileges on given fileId
   *
   * @param emails
   * @returns {Promise<void>}
   */
  async removeEditPrivilege(fileId, emails) {

  }

  async createSharedDrive(id, name) {
    console.log(`Creating drive folder for owner '${id}' - ${name}`)

    const sharedDriveMetadata = {
      requestBody: {
        name: name
      }
    }
    const sharedDrive = await new Promise((resolve, reject) => {
      return this.drive.drives
        .create({
          resource: sharedDriveMetadata,
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

    return sharedDrive
  }

  async setFilePermissionPublic(fileId) {
    const permissions = await new Promise((resolve, reject) => {
      return this.drive.permissions
        .create({
          fileId: fileId,
          fields: "id",
          sendNotificationEmails: false,
          resource: {
            type: "anyone",
            role: "writer",
            allowFileDiscovery: false
          }
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

    return permissions
  }

  async copyFileIntoDestinationFolder(fileId, folderDestinationId, name) {
    const newFile = await new Promise((resolve, reject) => {
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
            resolve(response.data)
          }
        })
        .catch(error => reject(error))
    })

    return newFile
  }

  async uploadFileIntoDestinationFolder(folderDestinationId, name, filePath) {
    const fileMetadata = {
        name: name,
        parents: [folderDestinationId]
      },
      fileMedia = {
        mimeType: getMimeType(filePath),
        body: fs.createReadStream(filePath)
      }

    const newFile = await new Promise((resolve, reject) => {
      return this.drive.files
        .create({
          media: fileMedia,
          resource: fileMetadata,
          fields: "id, webViewLink, name"
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

    this.setFilePermissionPublic(newFile.id)

    return newFile
  }
}

export default GDriveManager
