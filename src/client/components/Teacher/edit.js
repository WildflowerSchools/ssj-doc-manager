import React from "react"

import { withAuthorization, isAdmin } from "../Session"
import { withFirebase } from "../Firebase"

import TeacherForm from "./form"

import * as ROUTES from "../../constants/routes"

class EditForm extends React.Component {
  constructor(props) {
    super(props)

    this.history = props.history

    this.id = props.id
    this.state = {
      teacher: null
    }
  }

  componentDidMount() {
    this.props.firebase
      .teacher(this.id)
      .get()
      .then(record => {
        this.setState({ teacher: record.data() })
      })
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
        mode="edit"
        id={this.id}
        teacher={this.state.teacher}
        onSuccess={this.onSuccess}
        onFailure={this.onFailure}
      />
    )
  }
}

const TeacherEditBase = ({ firebase, history, match }) => (
  <div>
    <h3>Edit Teacher</h3>
    <EditForm id={match.params.id} firebase={firebase} history={history} />
  </div>
)

const TeacherEditPage = withFirebase(
  withAuthorization(isAdmin)(TeacherEditBase)
)
export default TeacherEditPage
