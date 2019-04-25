import React from 'react'

import { withAuthorization } from '../Session'

const HomePageBase = () => (
  <div>
    <h1>Home Page</h1>
    <p>The Home Page is accessible by every signed in user.</p>

    <Messages />
  </div>
);

const condition = authUser => !!authUser

const HomePage = withAuthorization(condition)(HomePageBase)
export default HomePage