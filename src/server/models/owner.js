import schoolModel from "./school"
import teacherModel from "./teacher"

const getOwner = async (ownerId, ownerType) => {
  switch (ownerType.toLowerCase()) {
    case "school":
      return await schoolModel.getSchool(ownerId)
    case "teacher":
      return await teacherModel.getTeacher(ownerId)
    default:
      return null
  }
}

export default { getOwner }
