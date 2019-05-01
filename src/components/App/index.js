import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import AdminPage from '../Admin'
import HomePage from '../Home'
import LandingPage from '../Landing'
import SignInPage from '../SignIn'

import Navigation from '../Navigation'

import { withAuthentication, AuthUserContext } from '../Session'

import * as ROUTES from '../../constants/routes'

const RouteAuthLanding = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <Route path={[ROUTES.HOME, ROUTES.LANDING]} component={HomePage} />
      ) : (
        <Route exact path={ROUTES.LANDING} component={LandingPage} />
      )
    }
  </AuthUserContext.Consumer>
)

const AppBase = () => (
  <Router>
    <div>
      <Navigation />
      
      <hr />
      
      <RouteAuthLanding />
      
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      
      <Route path={ROUTES.ADMIN} component={AdminPage} />
    </div>
  </Router>
)

const App = withAuthentication(AppBase)

export default App