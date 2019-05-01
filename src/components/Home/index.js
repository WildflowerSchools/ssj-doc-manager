import React from 'react'

import { withAuthorization } from '../Session'
import { UserDocumentList } from '../UserDocument'


const HomePageBase = () => (
  <div>
    <h1>My Documents</h1>
    <UserDocumentList />
  </div>
);

const condition = authUser => !!authUser

const HomePage = withAuthorization(condition)(HomePageBase)
export default HomePage