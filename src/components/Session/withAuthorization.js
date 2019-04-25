import React from 'react'
import { withRouter } from 'react-router-dom'

import AuthUserContext from './context'
import { withFirebase } from '../Firebase'
import * as ROUTES from '../../constants/routes'

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      this.listener = this.props.firebase.onAuthUserListener(
        authUser => {
          console.log("withAuthorization.js: Checking if authUser is valid")
          console.log(authUser)
          if (!condition(authUser)) {
            console.log("withAuthorization.js: AuthUser is not valid!")
            this.props.history.push(ROUTES.SIGN_IN)
          }
        },
        () => this.props.history.push(ROUTES.SIGN_IN),
      );
    }

    componentWillUnmount() {
      this.listener()
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser => {
              console.log("withAuthorization.js: In Consumer trigger - " + authUser)
              return condition(authUser) ? <Component {...this.props} /> : null
            }
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withRouter(withFirebase(WithAuthorization))
}

export default withAuthorization