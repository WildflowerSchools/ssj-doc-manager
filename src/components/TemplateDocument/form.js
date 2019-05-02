import React from 'react'
import Select from 'react-select';
import PropTypes from 'prop-types'

import { STATES_AS_OPTIONS } from '../../constants/states'
import { STAGES_AS_OPTIONS } from '../../constants/stages'

class TemplateForm extends React.Component {
  render() {
    return (
      <Formik
        initialValues={this.newTemplate}
        validationSchema={TemplateDocumentSchema}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false)
          
          this.props.firebase.template_document().add(
            values
          )
          .then(() => {
            actions.setErrors(null)
            actions.setSubmitting(false)
            
            this.props.history.push(ROUTES.ADMIN)
          })
         .catch(error => {
            actions.setErrors(error)
            actions.setSubmitting(false)
          })
        }}
      >
        {({ errors, touched, handleChange, setFieldTouched, setFieldValue, isSubmitting, isValid, values }) => (
          <Form>
            <label htmlFor="td_document_name">
              Document Name:
              <Field id="td_document_name" type="text" name="document_name" />
              <ErrorMessage name="document_name" className="error" component="div" />
            </label>
            <label htmlFor="td_document_url">
              Document URL:
              <Field id="td_document_url" type="url" name="document_url" />
              <ErrorMessage name="document_url" className="error" component="div" />
            </label>
            <label htmlFor="td_stage">
              Startup Journey Stage:
              <Field
                name="stage"
                component={({field}) =>
                  <Select
                    id="td_stage"
                    isMulti={false}
                    isClearable={true}
                    value={STAGES_AS_OPTIONS ? STAGES_AS_OPTIONS.find(option => option.value === field.value) : ''}
                    onChange={(option) => setFieldValue(field.name, (option === null ? '' : option.value) )}
                    onBlur={field.onBlur}
                    options={STAGES_AS_OPTIONS} />
                }
              />
              <ErrorMessage name="stage" className="error" component="div" />
            </label>
            <label htmlFor="td_all_states">
              Valid for All States?
              <Field
                id="td_all_states"
                name="all_states"
                type="checkbox"
                checked={values.all_states} />
              <ErrorMessage name="all_states" className="error" component="div" />
            </label>
            <label htmlFor="td_states">
              State
              <Field
                name="states"
                component={({field}) =>
                  <Select
                    id="td_states"
                    isClearable={true}
                    isDisabled={values.all_states}
                    isMulti={true}
                    value={STATES_AS_OPTIONS ? STATES_AS_OPTIONS.filter(option => field.value.includes(option.value)) : ''}
                    onChange={(option) => setFieldValue(field.name, (option === null ? [] : option.map((o) => o.value)) )}
                    onBlur={field.onBlur}
                    options={STATES_AS_OPTIONS} />
                }
              />
              <ErrorMessage name="states" className="error" component="div" />
            </label>
            <button type="submit" disabled={isSubmitting || !isValid}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    )
  }
}

TemplateForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  onSuccess: PropType.func.isRequired
  onFailure: PropType.func
};

export default TemplateForm
