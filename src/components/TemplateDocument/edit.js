import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAdmin } from '../Session'
import { withFirebase } from '../Firebase'
import TemplateForm from './form'

import * as ROUTES from '../../constants/routes'


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
    this.props.firebase.template_document(this.id).once('value')
    .then(function(template) {
      this.setState({ template: template   })
    })
  }
          
  onSuccess = (id) => {
    this.history.push(ROUTES.ADMIN)
  }
  
  onFailure = (error) => {
    console.log(error)
  }
  
  render() {
    return (
      <TemplateForm mode="edit" template={this.state.template} onSuccess={this.onSuccess} onFailure={this.onFailure} />
    )
  }
}
  
const TemplateEditBase = ({ id, firebase, history, match }) => (
  <div>
    <h3>Edit Template Document</h3>
    <EditForm id={id} firebase={firebase} history={history} />
  </div>
)

const TemplateEditPage = withFirebase(withAuthorization(isAdmin)(TemplateEditBase))
export default TemplateEditPage
