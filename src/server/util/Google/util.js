import readChunk from "read-chunk"
import fileType from "file-type"
import mimeType from "mime-types"

const getMimeType = filePath => {
  const buffer = readChunk.sync(filePath, 0, fileType.minimumBytes)

  return mimeType.lookup(fileType(buffer))
}

const getDocumentIdFromUrl = documentUrl => {
  // Create copy of Google Doc in user's Drive folder
  const docUrl = new URL(documentUrl)
  /* We want to strip the Drive ID from the Drive URL, but Drive URLs comes in two forms:
   * https://drive.google.com/open?id=<<ID>>
   * https://docs.google.com/document/d/<<ID>>/edit?usp=sharing
   */
  return (
    docUrl.searchParams.get("id") || documentUrl.match(/\/d\/(.{25,})\//)[1]
  )
}

export { getMimeType, getDocumentIdFromUrl }
