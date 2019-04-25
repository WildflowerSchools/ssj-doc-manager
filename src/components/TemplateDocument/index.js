import React from 'react'

import { withAuthorization } from '../Session'

import * as ROLES from '../../constants/roles'

const TemplatePageBase = () => (
  <div>
    <h1>Template Document Page</h1>
    <p>The Admin Page is only accessible by the admins.</p>
  </div>
);

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const TemplatePage = withAuthorization(condition)(TemplatePageBase)
export default TemplatePage
