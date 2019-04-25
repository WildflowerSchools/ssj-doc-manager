import React from 'react'

import { withAuthorization } from '../Session'

import * as ROLES from '../../constants/roles'

const AdminPageBase = () => (
  <div>
    <h1>Admin Page</h1>
    <p>The Admin Page is only accessible by the admins.</p>
  </div>
);

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const AdminPage = withAuthorization(condition)(AdminPageBase)
export default AdminPage
