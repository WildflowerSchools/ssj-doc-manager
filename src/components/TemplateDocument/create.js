import React from 'react'
import Select from 'react-select'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import * as Yup from 'yup'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAdmin } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'
import { STATES_AS_OPTIONS } from '../../constants/states'
import { STAGES_AS_OPTIONS } from '../../constants/stages'

const TemplateDocumentSchema = Yup.object().shape({
  document_name: Yup.string()
    .min(1, 'Too Short!')
    .required('Required'),
  document_url: Yup.string()
    .url('Invalid url')
    .required('Required'),
  stage: Yup.string()
    .ensure(),
  all_states: Yup.boolean(),
  states: Yup.array()
    .of(Yup.string()
        .ensure())
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
      <Formik
        initialValues={this.newTemplate}
        validationSchema={TemplateDocumentSchema}
        onSubmit={values => {
          // same shape as initial values
          console.log(values);
        }}
      >
        {({ errors, touched, handleChange, setFieldTouched, isSubmitting, values }) => (
          <Form>
            <label for="document_name">
              Document Name:
              <Field id="document_name" type="text" name="document_name" />
              <ErrorMessage name="document_name" className="error" component="div" />
            </label>
            <label for="document_url">
              Document URL:
              <Field id="document_url" type="url" name="document_url" />
              <ErrorMessage name="document_url" className="error" component="div" />
            </label>
            <label for="stage">
              Startup Journey Stage:
              <Select
                id="stage"
                value={values.stage}
                onChange={handleChange}
                onBlur={setFieldTouched}
                options={STAGES_AS_OPTIONS} />
              <ErrorMessage name="stage" className="error" component="div" />
            </label>
            <label for="all_states">
              Valid for All States?
              <Field
                id="all_states"
                name="all_states"
                type="checkbox"
                checked={values.all_states} />
              <ErrorMessage name="all_states" className="error" component="div" />
            </label>
            <label for="states">
              State
              <Select
                id="states"
                isDisabled={values.all_states}
                isMulti={true}
                options={STATES_AS_OPTIONS}
                onChange={handleChange}
                onBlur={setFieldTouched}
                value={values.states} />
              <ErrorMessage name="states" className="error" component="div" />
            </label>
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    )
  }
}

class TemplateCreateBase extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      error: null
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
        <CreateForm />
      </div>
    )
  }
}

const TemplateCreatePage = withFirebase(withAuthorization(isAdmin)(TemplateCreateBase))
export default TemplateCreatePage
