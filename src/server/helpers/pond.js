import config from "../config"
import fs from "fs"
import path from "path"

/**
 * Return filePath or null if file does not exist
 */
const getFilePath = fileId => {
  const filePath = path.join(config.UPLOAD_PATH, fileId)
  if (filePath && fs.existsSync(filePath)) {
    return filePath
  } else {
    return null
  }
}

const unlinkFile = fileId => {
  const filePath = getFilePath(fileId)

  fs.unlinkSync(filePath)
}

export default { getFilePath, unlinkFile }
