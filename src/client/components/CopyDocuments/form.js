import { ErrorMessage, Field, Formik, Form } from "formik"
import PropTypes from "prop-types"
import React from "react"
import * as Yup from "yup"

import { withFirebase } from "../Firebase"

import { API } from "../Api"
import Select from "react-select"

const CopyDocumentSchema = Yup.object()
  .shape({
    school: Yup.string().nullable(),
    teachers: Yup.array()
      .min(0)
      .of(Yup.string())
  })
  .test("isOwnerSelected", "No school or teachers selected", values => {
    return Boolean(values.school || (values.teachers && values.teachers.length))
  })

class CopyDocumentsForm extends React.Component {
  constructor(props) {
    super(props)

    this.initialFormData = {}

    this.state = {
      schoolOptions: [],
      teacherOptions: []
    }

    this.props.firebase.schools_as_options(this.setSchools)
    this.props.firebase.teachers_as_options(this.setTeachers)
  }

  setSchools = options => {
    this.setState({ schoolOptions: options })
  }

  setTeachers = options => {
    this.setState({ teacherOptions: options })
  }

  render() {
    const { templates, onSuccess, onFailure } = this.props

    return (
      <div>
        <Formik
          initialValues={this.initialFormData}
          validationSchema={CopyDocumentSchema}
          onSubmit={(values, actions) => {
            actions.setSubmitting(true)

            const schools = values.school ? [values.school] : null,
              teachers = values.teachers ? values.teachers : null

            API.makeCopy(templates, schools, teachers)
              .then(data => {
                actions.setSubmitting(false)
                onSuccess()
              })
              .catch(error => {
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
            <Form className="fullWidth">
              <label htmlFor="td_school">
                School
                <Field
                  name="school"
                  component={({ field }) => (
                    <Select
                      id="td_school"
                      isMulti={false}
                      isClearable={true}
                      isSearchable={true}
                      value={
                        this.state.schoolOptions && field.value
                          ? this.state.schoolOptions.filter(option =>
                              field.value.includes(option.value)
                            )
                          : ""
                      }
                      onChange={option =>
                        setFieldValue(field.name, option ? option.value : null)
                      }
                      onBlur={field.onBlur}
                      options={this.state.schoolOptions}
                    />
                  )}
                />
                <ErrorMessage name="school" className="error" component="div" />
              </label>
              <label htmlFor="td_teachers">
                Teachers
                <Field
                  name="teachers"
                  component={({ field }) => (
                    <Select
                      id="td_teachers"
                      isMulti={true}
                      isClearable={true}
                      isSearchable={true}
                      value={
                        this.state.teacherOptions && field.value
                          ? this.state.teacherOptions.filter(option =>
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
              {errors && errors[undefined] && (
                <div className="error">{errors[undefined]}</div>
              )}
              <p>Number of documents being copied: {templates.length}</p>
              <button type="submit" disabled={isSubmitting}>
                Make Copies
              </button>
            </Form>
          )}
        </Formik>
      </div>
    )
  }
}

CopyDocumentsForm.propTypes = {
  templates: PropTypes.array,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func
}

export default withFirebase(CopyDocumentsForm)
