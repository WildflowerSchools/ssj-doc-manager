export const LANDING = "/"
export const SIGN_IN = "/signin"
export const ADMIN = "/admin"
export const ADMIN_CREATE_TEMPLATE = "/admin/create_template"
export const ADMIN_EDIT_TEMPLATE = "/admin/edit_template/:id"
export const ADMIN_CREATE_SCHOOL = "/admin/create_school"
export const ADMIN_EDIT_SCHOOL = "/admin/edit_school/:id"
export const ADMIN_CREATE_TEACHER = "/admin/create_teacher"
export const ADMIN_EDIT_TEACHER = "/admin/edit_teacher/:id"

export const adminEditTemplateWithId = id =>
  ADMIN_EDIT_TEMPLATE.replace(":id", id)

export const adminEditSchoolWithId = id => ADMIN_EDIT_SCHOOL.replace(":id", id)

export const adminEditTeacherWithId = id =>
  ADMIN_EDIT_TEACHER.replace(":id", id)
