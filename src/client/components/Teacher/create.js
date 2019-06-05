import React from "react"

import { withAuthorization, isAdmin } from "../Session"
import { withRouter } from "react-router-dom"

import TeacherForm from "./form"

import * as ROUTES from "../../constants/routes"

class CreateForm extends React.Component {
  constructor(props) {
    super(props)

    this.history = props.history

    this.newTeacher = {
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
      <TeacherForm
        mode="create"
        teacher={this.newTeacher}
        onSuccess={this.onSuccess}
        onFailure={this.onFailure}
      />
    )
  }
}

const TeacherCreateBase = ({ history }) => (
  <div>
    <h3>Create Teacher</h3>
    <CreateForm history={history} />
  </div>
)

const TeacherCreatePage = withRouter(
  withAuthorization(isAdmin)(TeacherCreateBase)
)
export default TeacherCreatePage
