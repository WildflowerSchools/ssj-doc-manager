import React from 'react'
import Select from 'react-select'
import { Formik, Form, Field } from 'formik'
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
    const {
      errors,
      touched,
      handleChange,
      setFieldTouched,
      isSubmitting,
      values
    } = this.props;

    return (
      <Formik
        initialValues={this.newTemplate}
        validationSchema={TemplateDocumentSchema}
        onSubmit={values => {
          // same shape as initial values
          console.log(values);
        }}
      >
        <Form>
          <label>
            Document Name:
            <Field type="text" name="document_name" />
            {errors.document_name && touched.document_name ? (
              <div>{errors.document_name}</div>
            ) : null}
          </label>
          <label>
            Document URL:
            <Field type="url" name="document_url" />
          </label>
          <label>
            Startup Journey Stage:
            <Select
              id="stage"
              value={values.stage}
              onChange={handleChange}
              onBlur={setFieldTouched}
              options={STAGES_AS_OPTIONS} />
          </label>
          <label>
            Valid for All States?
            <Field
              name="all_states"
              type="checkbox"
              checked={values.all_states} />
          </label>
          <label >
            State
            <Select
              id="states"
              isDisabled={values.all_states}
              isMulti={true}
              options={STATES_AS_OPTIONS}
              onChange={handleChange}
              onBlur={setFieldTouched}
              value={values.states} />
          </label>
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
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
