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
