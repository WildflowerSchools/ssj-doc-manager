import React from "react"

import { withAuthorization, isAdmin } from "../Session"
import { withFirebase } from "../Firebase"

import SchoolForm from "./form"

import * as ROUTES from "../../constants/routes"

class EditForm extends React.Component {
  constructor(props) {
    super(props)

    this.history = props.history

    this.id = props.id
    this.state = {
      school: null
    }
  }

  componentDidMount() {
    this.props.firebase
      .school(this.id)
      .get()
      .then(record => {
        let school = record.data()

        school.teachers = school.teachers.map(t => t.id)
        this.setState({ school: school })
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
      <SchoolForm
        mode="edit"
        id={this.id}
        school={this.state.school}
        onSuccess={this.onSuccess}
        onFailure={this.onFailure}
      />
    )
  }
}

const SchoolEditBase = ({ firebase, history, match }) => (
  <div>
    <h3>Edit School</h3>
    <EditForm id={match.params.id} firebase={firebase} history={history} />
  </div>
)

const SchoolEditPage = withFirebase(withAuthorization(isAdmin)(SchoolEditBase))
export default SchoolEditPage
