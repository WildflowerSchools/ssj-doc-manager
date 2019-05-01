import React from 'react'

import { withAuthorization, isAdmin } from '../Session'
import { TemplateList } from '../TemplateDocument'

import * as ROLES from '../../constants/roles'


const AdminPageBase = () => (
  <div>
    <h1>Admin Page</h1>
    <p>The Admin Page is only accessible by the admins.</p>
    <TemplateList />
  </div>
);

const AdminPage = withAuthorization(isAdmin)(AdminPageBase)
export default AdminPage
