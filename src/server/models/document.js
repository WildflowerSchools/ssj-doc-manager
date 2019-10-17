import { firebase } from "../util/Firebase"
import { gClient } from "../util/Google"
import ownerModel from "./owner"
import templateModel from "./template"

const doesOwnerHaveDocument = async (ownerData, templateData) => {
  // Avoid replicating the same document multiple times for a give owner
  const templateIds = templateData.documents
    ? templateData.documents.map(td => td.id)
    : []
  const ownerDocumentIds = ownerData.documents
    ? ownerData.documents.map(d => d.id)
    : []
  const intersection = templateIds.filter(tid => ownerDocumentIds.includes(tid))
  return intersection.length > 0
}

const createDocumentForOwnerFromGoogleDocument = async (
  ownerId,
  ownerType,
  templateId,
  googleDocument
) => {
  const owner = await ownerModel.getOwner(ownerId, ownerType)
  if (owner === null) {
    return
  }

  const getTemplateRefHandleNull = async () => {
    if (templateId) {
      return await templateModel.getTemplate(templateId)
    } else {
      return {
        ref: () => {
          return null
        },
        data: () => {
          return templateModel.getEmptyModel()
        }
      }
    }
  }

  const template = await getTemplateRefHandleNull()

  let newDocument = Object.assign(
    template.data(),
    {
      owner: owner.ref(),
      template_document: template.ref(),
      document_name: template.data().document_name || googleDocument.name,
      document_url: googleDocument.webViewLink
    }
  )
  // The template that's copied has a "documents" array attribute that should be removed
  delete newDocument["documents"]

  // Create new document
  return await firebase.documents().add(newDocument)
}

const linkDocumentToOwner = (documentRef, ownerRef) => {
  ownerRef.update({
    documents: firebase.firestoreNS.FieldValue.arrayUnion(documentRef)
  })
}

const linkDocumentToTemplate = (documentRef, templateRef) => {
  templateRef.update({
    documents: firebase.firestoreNS.FieldValue.arrayUnion(documentRef)
  })
}

const copyDriveDocumentToFolder = async (googleDocumentId, folderId, name) => {
  try {
    const newFile = await gClient.driveManager.copyFileIntoDestinationFolder(
      googleDocumentId,
      folderId,
      name
    )
    return newFile
  } catch (err) {
    console.error(err.message)
    throw err
  }
}

const getDocument = async documentId => {
  const documentRef = firebase.document(documentId)
  const documentSnapshot = await documentRef.get()

  return {
    data: () => {
      return {
        ...documentSnapshot.data(),
        ...{ id: documentSnapshot.id }
      }
    },
    ref: () => {
      return documentRef
    }
  }
}

export default {
  getDocument,
  createDocumentForOwnerFromGoogleDocument,
  copyDriveDocumentToFolder,
  doesOwnerHaveDocument,
  linkDocumentToOwner,
  linkDocumentToTemplate
}
