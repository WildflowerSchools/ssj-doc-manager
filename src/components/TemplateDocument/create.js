import React from 'react'
import Select from 'react-select';
import { Formik } from 'formik';
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAdmin } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'
import { STATES_AS_OPTIONS } from '../../constants/states'
import { STAGES_AS_OPTIONS } from '../../constants/stages'

const TemplateDocumentSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  lastName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
});

class CreateForm extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    return (
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
        }}
        validationSchema={SignupSchema}
        onSubmit={values => {
          // same shape as initial values
          console.log(values);
        }}
      >
        <form onSubmit={this.handleSubmit}>
          <label>
            Document Name:
            <input type="text" defaultValue={this.state.newTemplate.document_name} />
          </label>
          <label>
            Document URL:
            <input type="text" value={this.state.newTemplate.document_url} />
          </label>
          <label>
            Startup Journey Stage:
            <Select
              defaultValue={this.state.newTemplate.stage}
              options={STAGES_AS_OPTIONS} />
          </label>
          <label>
            Valid for All States?
            <input
              name="all_states"
              type="checkbox"
              defaultChecked={this.state.newTemplate.all_states} />
          </label>
          <label >
            State
            <Select
              isDisabled={this.state.newTemplate.all_states}
              defaultValue={this.state.newTemplate.states}
              options={STATES_AS_OPTIONS}
              isMulti={true} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </Formik>
    )
  }
}

class TemplateCreateBase extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      error: null,
      newTemplate: {
        document_name: '',
        document_url: '',
        stage: '',
        all_states: false,
        states: []
      }
    }
  }
  
  handleSubmit() {
    return this.props.firebase.template_document().set(
      this.state.template
    )
    .then(() => {
      this.setState({ error: null })
      this.props.history.push(ROUTES.ADMIN)
    })
  }
  
  render() {
    return (
      <div>
        <h3>Create Template Document</h3>
        
      </div>
    )
  }
}

const TemplateCreatePage = withFirebase(withAuthorization(isAdmin)(TemplateCreateBase))
export default TemplateCreatePage
