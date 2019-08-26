import { ErrorMessage, Field, Formik, Form } from "formik"
import PropTypes from "prop-types"
import React from "react"
import * as Yup from "yup"

import { API } from "../Api"
import { withFirebase } from "../Firebase"
import Select from "react-select"

import { FilePond } from "react-filepond"

import "filepond/dist/filepond.css"

Yup.addMethod(Yup.object, "atLeastOneTeacherOrSchool", function(list) {
  return this.test({
    name: "atLeastOneOf",
    message: "An owner is required",
    exclusive: true,
    params: { keys: list.join(", ") },
    test: value => value == null || list.some(f => value[f] != null)
  })
})

const UploadSchema = Yup.object()
  .shape({
    name: Yup.string("Enter the document name").required("Name is required")
  })
  .atLeastOneTeacherOrSchool(["teacher", "school"])

class DocumentUploadForm extends React.Component {
  constructor(props) {
    super(props)

    this.document = Object.assign(
      {},
      { name: "", files: [], teacher: null, school: null },
      props.document
    )

    this.state = {
      schoolOptions: [],
      teacherOptions: [],
      schoolId: null,
      teacherId: null
    }

    this.props.firebase.teachers_as_options(this.setTeachers)
    this.props.firebase.schools_as_options(this.setSchools)
  }

  setSchools = options => {
    this.setState({ schoolOptions: options })
  }

  setTeachers = options => {
    this.setState({ teacherOptions: options })
  }

  setFiles = (fileItems, formikSetFieldValue) => {
    formikSetFieldValue("files", fileItems)
    formikSetFieldValue(
      "name",
      fileItems && fileItems.length > 0 ? fileItems[0].file.name : ""
    )
  }

  handleFilePondInit() {}

  render() {
    const { id, mode, onSuccess, onFailure } = this.props

    return (
      <div>
        {this.document !== null ? (
          <Formik
            initialValues={this.document}
            validationSchema={UploadSchema}
            onSubmit={(values, actions) => {
              actions.setSubmitting(true)

              let final = Object.assign({}, values)

              if (mode !== "create" && mode !== "edit") {
                actions.setErrors(
                  "Internal error: Mode should be 'edit' or 'create'"
                )
                onFailure("Internal error")
                return
              }

              const action = (() => {
                if (final.school) {
                  return API.uploadFileForSchool(
                    final.school,
                    final.files[0].serverId,
                    final.name
                  )
                }
                if (final.teacher) {
                  return API.uploadFileForTeacher(
                    final.teacher,
                    final.files[0].serverId,
                    final.name
                  )
                }
              })()

              action
                .then(data => {
                  actions.setErrors(null)
                  actions.setSubmitting(false)

                  onSuccess()
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
                <h4>File Owner</h4>
                {values.school === null && (
                  <label htmlFor="td_teachers">
                    Teacher
                    <Field
                      name="teacher"
                      component={({ field }) => (
                        <Select
                          id="td_teachers"
                          name="teacher"
                          placeholder="Teacher..."
                          isClearable={true}
                          isDisabled={values.school !== null}
                          onChange={option =>
                            setFieldValue(
                              field.name,
                              option ? option.value : null
                            )
                          }
                          value={
                            this.state.teacherOptions && field.value
                              ? this.state.teacherOptions.filter(option =>
                                  field.value.includes(option.value)
                                )
                              : []
                          }
                          options={this.state.teacherOptions}
                        />
                      )}
                    />
                    <ErrorMessage
                      name="teachers"
                      className="error"
                      component="div"
                    />
                  </label>
                )}
                {values.teacher === null && (
                  <label htmlFor="td_schools">
                    School
                    <Field
                      name="school"
                      component={({ field }) => (
                        <Select
                          id="td_schools"
                          name="school"
                          placeholder="School..."
                          isClearable={true}
                          isDisabled={values.teacher !== null}
                          onChange={option =>
                            setFieldValue(
                              field.name,
                              option ? option.value : null
                            )
                          }
                          value={
                            this.state.schoolOptions && field.value
                              ? this.state.schoolOptions.filter(option =>
                                  field.value.includes(option.value)
                                )
                              : []
                          }
                          options={this.state.schoolOptions}
                        />
                      )}
                    />
                    <ErrorMessage
                      name="schools"
                      className="error"
                      component="div"
                    />
                  </label>
                )}

                {errors && errors[undefined] && (
                  <div className="error">{errors[undefined]}</div>
                )}

                <h4>File Details</h4>
                <FilePond
                  ref={ref => (this.pond = ref)}
                  name="file"
                  files={values.files}
                  allowMultiple={false}
                  server="/pond"
                  oninit={() => this.handleFilePondInit()}
                  onupdatefiles={fileItems => {
                    this.setFiles(fileItems, setFieldValue)
                  }}
                />
                <label htmlFor="td_document_name">
                  Document Name:
                  <Field
                    id="td_document_name"
                    type="text"
                    name="name"
                    disabled={values.files.length === 0}
                    autoComplete="off"
                  />
                  <ErrorMessage name="name" className="error" component="div" />
                </label>
                <button type="submit" disabled={isSubmitting}>
                  Upload
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

DocumentUploadForm.propTypes = {
  id: PropTypes.string,
  document: PropTypes.object,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func
}

export default withFirebase(DocumentUploadForm)
