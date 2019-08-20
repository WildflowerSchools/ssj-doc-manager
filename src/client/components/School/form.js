import { ErrorMessage, Field, Formik, Form } from "formik"
import PropTypes from "prop-types"
import React from "react"
import Select from "react-select"
import * as Yup from "yup"

import { withFirebase } from "../Firebase"

import { API } from "../Api"

const SchoolSchema = Yup.object().shape({
  name: Yup.string("Enter the name of the school").required("Name is required"),
  teachers: Yup.array()
    .min(0)
    .of(Yup.string())
})

class SchoolForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      teacherOptions: []
    }

    this.props.firebase.teachers_as_options(this.setTeachers)
  }

  setTeachers = options => {
    this.setState({ teacherOptions: options })
  }

  render() {
    const { id, school, mode, onSuccess, onFailure } = this.props

    return (
      <div>
        {school !== null ? (
          <Formik
            initialValues={school}
            validationSchema={SchoolSchema}
            onSubmit={(values, actions) => {
              actions.setSubmitting(false)

              let final = Object.assign({}, values)
              final.teachers = values.teachers
                ? values.teachers.map(tid => this.props.firebase.teacher(tid))
                : []

              let firebaseAction = null
              if (mode === "create") {
                Object.assign(final, { documents: [] }) // Add documents field on create
                firebaseAction = this.props.firebase.schools().add(final)
              } else if (mode === "edit") {
                firebaseAction = this.props.firebase.school(id).update(final)
              } else {
                actions.setErrors(
                  "Internal error: Mode should be 'edit' or 'create'"
                )
                onFailure("Internal error")
                return
              }

              firebaseAction
                .then(docRef => {
                  let _id = mode === "create" ? docRef.id : id

                  return API.createDriveFolderForSchool(_id).then(response => {
                    return _id
                  })
                })
                .then(id => {
                  actions.setErrors(null)
                  actions.setSubmitting(false)

                  onSuccess(id)
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
                <label htmlFor="td_school_name">
                  School Name:
                  <Field
                    id="td_school_name"
                    type="text"
                    name="name"
                    autoComplete="off"
                  />
                  <ErrorMessage name="name" className="error" component="div" />
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
                <button type="submit" disabled={isSubmitting}>
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

SchoolForm.propTypes = {
  id: PropTypes.string,
  school: PropTypes.object,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func
}

export default withFirebase(SchoolForm)
