import React from "react"
import { BrowserRouter as Router, Route } from "react-router-dom"

import AdminPage from "../Admin"
import { TemplateCreatePage, TemplateEditPage } from "../TemplateDocument/"
import { DocumentUploadPage } from "../Document/"
import { SchoolCreatePage, SchoolEditPage } from "../School/"
import { TeacherCreatePage, TeacherEditPage } from "../Teacher/"
import LandingPage from "../Landing"
import SignInPage from "../SignIn"

import Navigation from "../Navigation"

import { withAuthentication, AuthUserContext } from "../Session"

import * as ROUTES from "../../constants/routes"

const RouteAuthLanding = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <Route exact path={[ROUTES.LANDING]} component={AdminPage} />
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
      <Route
        exact
        path={ROUTES.ADMIN_CREATE_TEMPLATE}
        component={TemplateCreatePage}
      />
      <Route
        exact
        path={ROUTES.ADMIN_EDIT_TEMPLATE}
        component={TemplateEditPage}
      />

      <Route
        exact
        path={ROUTES.ADMIN_UPLOAD_DOCUMENT}
        component={DocumentUploadPage}
      />

      <Route
        exact
        path={ROUTES.ADMIN_CREATE_SCHOOL}
        component={SchoolCreatePage}
      />
      <Route exact path={ROUTES.ADMIN_EDIT_SCHOOL} component={SchoolEditPage} />
      <Route
        exact
        path={ROUTES.ADMIN_CREATE_TEACHER}
        component={TeacherCreatePage}
      />
      <Route
        exact
        path={ROUTES.ADMIN_EDIT_TEACHER}
        component={TeacherEditPage}
      />
    </div>
  </Router>
)

const App = withAuthentication(AppBase)

export default App
