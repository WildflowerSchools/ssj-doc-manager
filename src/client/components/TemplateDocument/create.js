import React from "react"

import { withAuthorization, isAdmin } from "../Session"
import { withRouter } from "react-router-dom"

import TemplateForm from "./form"

import * as ROUTES from "../../constants/routes"

class CreateForm extends React.Component {
  constructor(props) {
    super(props)

    this.history = props.history

    this.newTemplate = {
      document_name: "",
      document_url: "",
      stage: "",
      all_states: false,
      states: []
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
      <TemplateForm
        mode="create"
        template={this.newTemplate}
        onSuccess={this.onSuccess}
        onFailure={this.onFailure}
      />
    )
  }
}

const TemplateCreateBase = ({ history }) => (
  <div>
    <h3>Create Template Document</h3>
    <CreateForm history={history} />
  </div>
)

const TemplateCreatePage = withRouter(
  withAuthorization(isAdmin)(TemplateCreateBase)
)
export default TemplateCreatePage
