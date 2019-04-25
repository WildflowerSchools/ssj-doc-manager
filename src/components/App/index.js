import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { collectionData } from 'rxfire/firestore'

import SignInPage from '../SignIn'
import HomePage from '../Home'

import { withFirebase } from '../Firebase'
import { withAuthentication } from '../Session'

import * as ROUTES from '../../constants/routes'

const AppBase = () => (
  <Router>
    <div>
      <Route exact path={ROUTES.LANDING} component={HomePage} />

      <Route path={ROUTES.SIGN_IN} component={SignInPage} />

      <Route path={ROUTES.HOME} component={HomePage} />
    </div>
  </Router>
)

const App = withFirebase(AppBase)

export default App