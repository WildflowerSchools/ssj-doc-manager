import { SSJError, SSJWarning } from "../errors"
import { gClient } from "../util/Google"
import { getDocumentIdFromUrl } from "../util/Google/util"
import documentModel from "../models/document"
import ownerModel from "../models/owner"
import templateModel from "../models/template"
import pondHelper from "./pond"

/**
 * Create a Google Drive folder for a given school or teacher. Will not generate a Drive folder if one already exists.
 *
 * @param ownerId
 * @param ownerType
 */
const generateDriveFolderForOwner = async (ownerId, ownerType) => {
  console.log(
    `Attempting to generate a drive folder for ${ownerType} '${ownerId}' if drive folder does not exist`
  )

  const owner = await ownerModel.getOwner(ownerId, ownerType)
  if (!owner) {
    throw new SSJError(
      `No ${ownerType.toLowerCase()} found`,
      404,
      `Unable to find ${ownerType.toLowerCase()} record '${ownerId}`
    )
  }

  if (owner.data().drive_folder && owner.data().drive_folder.id) {
    console.log(
      `Drive folder already exists for ${ownerType} '${ownerId}': ${JSON.stringify(
        owner.data().drive_folder
      )}`
    )
    return
  }

  const createDriveFolder = async () => {
    try {
      return await gClient.driveManager.createRootFolder(ownerId)
    } catch (err) {
      throw new SSJError(
        "Unable to create Drive folder",
        500,
        `Failed generating a Drive folder for ${ownerType.toLowerCase()} '${ownerId}': ${err}`
      )
    }
  }
  const driveFolder = await createDriveFolder()

  console.log(
    `Generated a new drive folder for ${ownerType} '${ownerId}' - ${driveFolder.webViewLink}`
  )
  await owner.ref().update({
    drive_folder: {
      id: driveFolder.id,
      webViewLink: driveFolder.webViewLink
    }
  })
}

const createDocumentForOwnerFromTemplate = async (
  ownerId,
  ownerType,
  templateId
) => {
  // Verify the drive folder exists
  await generateDriveFolderForOwner(ownerId, ownerType)

  const owner = await ownerModel.getOwner(ownerId, ownerType)

  const template = await templateModel.getTemplate(templateId)
  if (!template) {
    throw new SSJError(
      "Unable to find template",
      404,
      `Template missing ${templateId}'`
    )
  }

  const hasDocument = await documentModel.doesOwnerHaveDocument(
    owner.data(),
    template.data()
  )
  if (hasDocument) {
    throw new SSJWarning(
      "Owner already has a copy of document",
      `${owner.data().name} already has copy of ${
        template.data().document_name
      }'`
    )
  }

  const templateGoogleDocumentId = getDocumentIdFromUrl(
    template.data().document_url
  )
  const newFile = await (async () => {
    try {
      return await documentModel.copyDriveDocumentToFolder(
        templateGoogleDocumentId,
        owner.data().drive_folder.id,
        template.data().document_name
      )
    } catch (err) {
      throw new SSJError(
        "Unable to make copy of Drive Document",
        500,
        `Failed creating copy of Drive Document ${
          template.data().document_url
        }: ${err}`
      )
    }
  })()

  const newDocumentRef = await (async () => {
    try {
      return await documentModel.createDocumentForOwnerFromGoogleDocument(
        ownerId,
        ownerType,
        templateId,
        newFile
      )
    } catch (err) {
      throw new SSJError(
        "Unable to save Document record in database",
        500,
        `Failed creating a Document record for the new Google Doc ${newFile.name}: ${err}`
      )
    }
  })()

  // Link document to template and owner
  documentModel.linkDocumentToOwner(newDocumentRef, owner.ref())
  documentModel.linkDocumentToTemplate(newDocumentRef, template.ref())
}

const createDocumentForOwnerFromFile = async (
  ownerId,
  ownerType,
  tmpFileId,
  fileName
) => {
  // Verify the drive folder exists
  await generateDriveFolderForOwner(ownerId, ownerType)

  const owner = await ownerModel.getOwner(ownerId, ownerType)
  const driveFolderId = owner.data().drive_folder.id

  const filePath = pondHelper.getFilePath(tmpFileId)
  if (!filePath) {
    throw new SSJError(
      `No file found`,
      404,
      `Unable to find file record: ${tmpFileId}`
    )
  }

  const uploadFileToFolder = async () => {
    try {
      return await gClient.driveManager.uploadFileIntoDestinationFolder(
        driveFolderId,
        fileName,
        filePath
      )
    } catch (err) {
      throw new SSJError(
        "Unable to upload file to Drive folder",
        500,
        `Failed uploading file to Drive folder ${driveFolderId}: ${err}`
      )
    }
  }
  const newFile = await uploadFileToFolder()

  // Create document record in Firebase for newFile
  const newDocumentRef = await documentModel.createDocumentForOwnerFromGoogleDocument(
    ownerId,
    ownerType,
    null,
    newFile
  )
  // Link document to template and owner
  documentModel.linkDocumentToOwner(newDocumentRef, owner.ref())
}

export default {
  createDocumentForOwnerFromFile,
  createDocumentForOwnerFromTemplate,
  generateDriveFolderForOwner
}
