export const LANDING = '/'
export const SIGN_IN = '/signin'
export const HOME = '/home'
export const ADMIN = '/admin'
export const ADMIN_CREATE_TEMPLATE = '/admin/create_template'
export const ADMIN_EDIT_TEMPLATE = '/admin/edit_template/:id'

export const adminEditTemplateWithId = (id) => 
  ADMIN_EDIT_TEMPLATE.replace(':id', id)