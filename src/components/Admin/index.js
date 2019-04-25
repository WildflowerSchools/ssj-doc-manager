import React from 'react'

import { withAuthorization } from '../Session'
import { TemplateList } from '../TemplateDocument'

import * as ROLES from '../../constants/roles'


const AdminPageBase = () => (
  <div>
    <h1>Admin Page</h1>
    <p>The Admin Page is only accessible by the admins.</p>
    <TemplateList />
  </div>
);

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const AdminPage = withAuthorization(condition)(AdminPageBase)
export default AdminPage
