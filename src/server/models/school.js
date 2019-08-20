import { firebase } from "../util/Firebase"
import ownerHelper from "../helpers/owners"

/**
 * Fetch school, certify that the school's Drive Folder exists
 *
 * @param schoolId
 * @returns {Promise<{ref: (function(): *), data: (function())}>}
 */
const getSchool = async schoolId => {
  try {
    const schoolRef = firebase.school(schoolId)
    const schoolSnapshot = await schoolRef.get()

    return {
      data: () => {
        return {
          ...schoolSnapshot.data(),
          ...{ id: schoolSnapshot.id }
        }
      },
      ref: () => {
        return schoolRef
      }
    }
  } catch (err) {
    console.error(`Unable to find school ${schoolId}`)
    return null
  }
}

export default { getSchool }
