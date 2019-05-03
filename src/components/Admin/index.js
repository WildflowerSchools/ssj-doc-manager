import React from 'react'

import { withAuthorization, isAdmin } from '../Session'
import { TemplateList } from '../TemplateDocument'

import * as ROLES from '../../constants/roles'


const AdminPageBase = () => (
  <div>
    <h1>Template Library</h1>
    <TemplateList />
  </div>
);

const AdminPage = withAuthorization(isAdmin)(AdminPageBase)
export default AdminPage
