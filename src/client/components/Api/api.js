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

  static createDriveFolderForTeacher = teacherId => {
    return client
      .post(`teachers/${teacherId}/generate_drive_folder`)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  }

  static createDriveFolderForSchool = schoolId => {
    return client
      .post(`schools/${schoolId}/generate_drive_folder`)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  }
}

export default API
