import { ErrorMessage, Field, Formik, Form } from "formik"
import PropTypes from "prop-types"
import React from "react"
import Select from "react-select"
import * as Yup from "yup"

import { withFirebase } from "../Firebase"

import { STATES_AS_OPTIONS } from "../../constants/states"
import { STAGES_AS_OPTIONS } from "../../constants/stages"

const TemplateDocumentSchema = Yup.object().shape({
  document_name: Yup.string("Enter the name of the document").required(
    "Name is required"
  ),
  document_url: Yup.string()
    .url("Document URL is invalid")
    .required("Document URL is required"),
  stage: Yup.string().ensure(),
  all_states: Yup.boolean(),
  states: Yup.array()
    .min(0)
    .of(Yup.string())
})

class TemplateForm extends React.Component {
  render() {
    const { id, template, mode, onSuccess, onFailure } = this.props

    return (
      <div>
        {template !== null ? (
          <Formik
            initialValues={template}
            validationSchema={TemplateDocumentSchema}
            onSubmit={(values, actions) => {
              actions.setSubmitting(false)

              let firebaseAction = null
              if (mode === "create") {
                firebaseAction = this.props.firebase
                  .template_documents()
                  .add(values)
              } else if (mode === "edit") {
                firebaseAction = this.props.firebase
                  .template_document(id)
                  .update(values)
              } else {
                actions.setErrors(
                  "Internal error: Mode should be 'edit' or 'create'"
                )
                onFailure("Internal error")
                return
              }

              firebaseAction
                .then(docRef => {
                  actions.setErrors(null)
                  actions.setSubmitting(false)

                  let _id = mode === "create" ? docRef.id : id
                  onSuccess(_id)
                })
                .catch(error => {
                  actions.setErrors(error)
                  actions.setSubmitting(false)

                  onFailure(error)
                })
            }}
          >
            {({
              errors,
              touched,
              handleChange,
              setFieldTouched,
              setFieldValue,
              isSubmitting,
              isValid,
              values
            }) => (
              <Form>
                <label htmlFor="td_document_name">
                  Document Name:
                  <Field
                    id="td_document_name"
                    type="text"
                    name="document_name"
                  />
                  <ErrorMessage
                    name="document_name"
                    className="error"
                    component="div"
                  />
                </label>
                <label htmlFor="td_document_url">
                  Document URL:
                  <Field id="td_document_url" type="url" name="document_url" />
                  <ErrorMessage
                    name="document_url"
                    className="error"
                    component="div"
                  />
                </label>
                <label htmlFor="td_stage">
                  Startup Journey Stage:
                  <Field
                    name="stage"
                    component={({ field }) => (
                      <Select
                        id="td_stage"
                        isMulti={false}
                        isClearable={true}
                        value={
                          STAGES_AS_OPTIONS
                            ? STAGES_AS_OPTIONS.find(
                                option => option.value === field.value
                              )
                            : ""
                        }
                        onChange={option =>
                          setFieldValue(
                            field.name,
                            option === null ? "" : option.value
                          )
                        }
                        onBlur={field.onBlur}
                        options={STAGES_AS_OPTIONS}
                      />
                    )}
                  />
                  <ErrorMessage
                    name="stage"
                    className="error"
                    component="div"
                  />
                </label>
                <label htmlFor="td_all_states">
                  Valid for All States?
                  <Field
                    id="td_all_states"
                    name="all_states"
                    type="checkbox"
                    checked={values.all_states}
                  />
                  <ErrorMessage
                    name="all_states"
                    className="error"
                    component="div"
                  />
                </label>
                <label htmlFor="td_states">
                  State
                  <Field
                    name="states"
                    component={({ field }) => (
                      <Select
                        id="td_states"
                        isClearable={true}
                        isDisabled={values.all_states}
                        isMulti={true}
                        value={
                          STATES_AS_OPTIONS
                            ? STATES_AS_OPTIONS.filter(option =>
                                field.value.includes(option.value)
                              )
                            : []
                        }
                        onChange={option =>
                          setFieldValue(
                            field.name,
                            option === null ? [] : option.map(o => o.value)
                          )
                        }
                        onBlur={field.onBlur}
                        options={STATES_AS_OPTIONS}
                      />
                    )}
                  />
                  <ErrorMessage
                    name="states"
                    className="error"
                    component="div"
                  />
                </label>
                <button
                  type="submit"
                  disabled={
                    isSubmitting /*TODO: Whats up w/ isValid? -> || !isValid */
                  }
                >
                  Submit
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    )
  }
}

TemplateForm.propTypes = {
  id: PropTypes.string,
  template: PropTypes.object,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func
}

export default withFirebase(TemplateForm)
