import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import AdminPage from '../Admin'
import { TemplateCreatePage, TemplateEditPage } from '../TemplateDocument/'
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
        <Route exact path={[ROUTES.HOME, ROUTES.LANDING]} component={HomePage} />
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
      
      <Route exact path={ROUTES.ADMIN} component={AdminPage} />
      <Route exact path={ROUTES.ADMIN_CREATE_TEMPLATE} component={TemplateCreatePage} />
      <Route exact path={ROUTES.ADMIN_EDIT_TEMPLATE} component={TemplateEditPage} />
      
    </div>
  </Router>
)

const App = withAuthentication(AppBase)

export default App