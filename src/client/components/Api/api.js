import axios from "axios"

const client = axios.create({
  baseURL: "/"
})

class API {
  static makeCopy = (templateIds, schoolIds, teacherIds) => {
    return client
      .post("/documents/copy", {
        templateIds: templateIds,
        schoolIds: schoolIds,
        teacherIds: teacherIds
      })
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  }

  static _createDriveFolderForOwner = (ownerType, ownerId) => {
    return client
      .post(`${ownerType}/${ownerId}/generate_drive_folder`)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  }

  static createDriveFolderForTeacher = teacherId => {
    return this._createDriveFolderForOwner("teachers", teacherId)
  }

  static createDriveFolderForSchool = schoolId => {
    return this._createDriveFolderForOwner("schools", schoolId)
  }

  static _uploadFileForOwner = (ownerType, ownerId, fileId, name) => {
    return client
      .post(`${ownerType}/${ownerId}/upload`, {
        fileId: fileId,
        name: name
      })
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  }

  static uploadFileForTeacher = (teacherId, fileId, name) => {
    return this._uploadFileForOwner("teachers", teacherId, fileId, name)
  }

  static uploadFileForSchool = (schoolId, fileId, name) => {
    return this._uploadFileForOwner("schools", schoolId, fileId, name)
  }
}

export default API
