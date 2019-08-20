import { firebase } from "../util/Firebase"
import ownerHelper from "../helpers/owners"

/**
 * Fetch teacher, certify that the teacher's Drive Folder exists
 *
 * @param teacherId
 * @returns {Promise<{ref: (function(): *), data: (function())}>}
 */
const getTeacher = async teacherId => {
  try {
    const teacherRef = firebase.teacher(teacherId)
    const teacherSnapshot = await teacherRef.get()

    return {
      data: () => {
        return {
          ...teacherSnapshot.data(),
          ...{ id: teacherSnapshot.id }
        }
      },
      ref: () => {
        return teacherRef
      }
    }
  } catch (err) {
    console.error(`Unable to find teacher ${teacherId}`)
    return null
  }
}

export default { getTeacher }
