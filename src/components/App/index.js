import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import AdminPage from '../Admin'
import HomePage from '../Home'
import LandingPage from '../Landing'
import SignInPage from '../SignIn'

import { withAuthentication } from '../Session'

import * as ROUTES from '../../constants/routes'

const AppBase = () => (
  <Router>
    <div>
      <Route exact path={ROUTES.LANDING} component={LandingPage} />

      <Route path={ROUTES.SIGN_IN} component={SignInPage} />

      <Route path={ROUTES.HOME} component={HomePage} />
      
      <Route path={ROUTES.ADMIN} component={AdminPage} />
    </div>
  </Router>
)

const App = withAuthentication(AppBase)

export default App