import React from "react"

import { withAuthorization, isAdmin } from "../Session"
import { withRouter } from "react-router-dom"

import SchoolForm from "./form"

import * as ROUTES from "../../constants/routes"

class CreateForm extends React.Component {
  constructor(props) {
    super(props)

    this.history = props.history

    this.newSchool = {
      name: ""
    }
  }

  onSuccess = id => {
    this.history.push(ROUTES.ADMIN)
  }

  onFailure = error => {
    console.log(error)
  }

  render() {
    return (
      <SchoolForm
        mode="create"
        school={this.newSchool}
        onSuccess={this.onSuccess}
        onFailure={this.onFailure}
      />
    )
  }
}

const SchoolCreateBase = ({ history }) => (
  <div>
    <h3>Create School</h3>
    <CreateForm history={history} />
  </div>
)

const SchoolCreatePage = withRouter(
  withAuthorization(isAdmin)(SchoolCreateBase)
)
export default SchoolCreatePage
