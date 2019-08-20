import React from "react"

import { withAuthorization, isAdmin } from "../Session"
import { withRouter } from "react-router-dom"

import DocumentUploadForm from "./uploadForm"

import * as ROUTES from "../../constants/routes"

class UploadForm extends React.Component {
  constructor(props) {
    super(props)

    this.history = props.history

    this.newDocument = {
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
      <DocumentUploadForm
        mode="create"
        document={this.newDocument}
        onSuccess={this.onSuccess}
        onFailure={this.onFailure}
      />
    )
  }
}

const DocumentCreateBase = ({ history }) => (
  <div>
    <h3>Upload Document</h3>
    <UploadForm history={history} />
  </div>
)

const DocumentUploadPage = withRouter(
  withAuthorization(isAdmin)(DocumentCreateBase)
)
export default DocumentUploadPage
