import React from 'react'
import Select from 'react-select'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import * as Yup from 'yup'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAdmin } from '../Session'
import { withFirebase } from '../Firebase'
import { withRouter } from 'react-router-dom'

import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'
import { STATES_AS_OPTIONS } from '../../constants/states'
import { STAGES_AS_OPTIONS } from '../../constants/stages'

const TemplateDocumentSchema = Yup.object().shape({
  document_name: Yup.string("Enter the name of the document")
    .required('Name is required'),
  document_url: Yup.string()
    .url('Document URL is invalid')
    .required('Document URL is required'),
  stage: Yup.string()
    .ensure(),
  all_states: Yup.boolean(),
  states: Yup.array()
    .of(Yup.string())
})

class CreateForm extends React.Component {
  constructor(props) {
    super(props)
    
    this.newTemplate = {
      document_name: '',
      document_url: '',
      stage: '',
      all_states: false,
      states: []
    }
  }
  
  render() {
    return (
      
    )
  }
}

const TemplateCreateBase = ({ firebase, history }) => (
  <div>
    <h3>Create Template Document</h3>
    <CreateForm firebase={firebase} history={history} />
  </div>
)

const TemplateCreatePage = withRouter(withFirebase(withAuthorization(isAdmin)(TemplateCreateBase)))
export default TemplateCreatePage
