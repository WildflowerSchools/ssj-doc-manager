import React from 'react'

import { withAuthorization, isAuthenticated } from '../Session'
import { UserDocumentList } from '../UserDocument'


const HomePageBase = () => (
  <div>
    <h1>My Documents</h1>
    <UserDocumentList />
  </div>
);

const HomePage = withAuthorization(isAuthenticated)(HomePageBase)
export default HomePage