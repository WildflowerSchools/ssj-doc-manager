import React from 'react'
import { withRouter } from 'react-router-dom'

import AuthUserContext from './context'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      this.listener = this.props.firebase.onAuthUserListener(
        authUser => {
          if (!condition(authUser)) {
            this.props.history.push(ROUTES.SIGN_IN)
          }
        },
        () => this.props.history.push(ROUTES.SIGN_IN),
      )
    }

    componentWillUnmount() {
      this.listener()
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser => {
              return condition(authUser) ? <Component {...this.props} /> : null
            }
          }
        </AuthUserContext.Consumer>
      )
    }
  }

  return withRouter(withFirebase(WithAuthorization))
}

const isAuthenticated = authUser => !!authUser
const isAdmin = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

export default withAuthorization

export { isAuthenticated, isAdmin }