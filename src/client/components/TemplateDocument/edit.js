import React from "react"

import { withAuthorization, isAdmin } from "../Session"
import { withFirebase } from "../Firebase"
import TemplateForm from "./form"

import * as ROUTES from "../../constants/routes"

class EditForm extends React.Component {
  constructor(props) {
    super(props)

    this.history = props.history

    this.id = props.id
    this.state = {
      template: null
    }
  }

  componentDidMount() {
    this.props.firebase
      .template_document(this.id)
      .get()
      .then(template => {
        this.setState({ template: template.data() })
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
      <TemplateForm
        mode="edit"
        id={this.id}
        template={this.state.template}
        onSuccess={this.onSuccess}
        onFailure={this.onFailure}
      />
    )
  }
}

const TemplateEditBase = ({ firebase, history, match }) => (
  <div>
    <h3>Edit Template Document</h3>
    <EditForm id={match.params.id} firebase={firebase} history={history} />
  </div>
)

const TemplateEditPage = withFirebase(
  withAuthorization(isAdmin)(TemplateEditBase)
)
export default TemplateEditPage
