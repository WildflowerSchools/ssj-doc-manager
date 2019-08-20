import { ErrorMessage, Field, Formik, Form } from "formik"
import PropTypes from "prop-types"
import React from "react"
import * as Yup from "yup"

import { API } from "../Api"
import { withFirebase } from "../Firebase"
import Select from "react-select"

const TeacherSchema = Yup.object().shape({
  name: Yup.string("Enter the name of the teacher").required("Name is required")
})

class TeacherForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      schoolOptions: [],
      schoolIdOriginal: null,
      schoolId: null
    }

    if (this.props.id) {
      this.props.firebase.teachers_school(this.props.id, this.initTeacherSchool)
    }
    this.props.firebase.schools_as_options(this.setSchools)
  }

  setSchools = options => {
    this.setState({ schoolOptions: options })
  }

  initTeacherSchool = schoolId => {
    this.setState({ schoolIdOriginal: schoolId, schoolId: schoolId })
  }

  setTeacherSchool = schoolId => {
    this.setState({ schoolId: schoolId })
  }

  render() {
    const { id, teacher, mode, onSuccess, onFailure } = this.props

    return (
      <div>
        {teacher !== null ? (
          <Formik
            initialValues={teacher}
            validationSchema={TeacherSchema}
            onSubmit={(values, actions) => {
              actions.setSubmitting(true)

              let final = Object.assign({}, values)

              let firebaseAction = null
              if (mode === "create") {
                Object.assign(final, { documents: [] }) // Add documents field on create
                firebaseAction = this.props.firebase.teachers().add(final)
              } else if (mode === "edit") {
                firebaseAction = this.props.firebase.teacher(id).update(final)
              } else {
                actions.setErrors(
                  "Internal error: Mode should be 'edit' or 'create'"
                )
                onFailure("Internal error")
                return
              }

              firebaseAction
                .then(docRef => {
                  let updates = []

                  let _id = mode === "create" ? docRef.id : id

                  if (this.state.schoolIdOriginal !== this.state.schoolId) {
                    if (mode === "edit") {
                      updates.push(
                        this.props.firebase.school_remove_teacher(
                          this.state.schoolIdOriginal,
                          _id
                        )
                      )
                    }

                    updates.push(
                      this.props.firebase.school_add_teacher(
                        this.state.schoolId,
                        _id
                      )
                    )
                  }

                  updates.push(API.createDriveFolderForTeacher(_id))

                  return Promise.all(updates).then(responses => {
                    return [_id, responses]
                  })
                })
                .then((id, _) => {
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
                <label htmlFor="td_teacher_name">
                  Teacher Name:
                  <Field
                    id="td_teacher_name"
                    type="text"
                    name="name"
                    autoComplete="off"
                  />
                  <ErrorMessage name="name" className="error" component="div" />
                </label>
                <label htmlFor="td_schools">
                  School
                  <Select
                    id="td_schools"
                    isClearable={true}
                    onChange={v => this.setTeacherSchool(v ? v.value : null)}
                    value={
                      this.state.schoolOptions && this.state.schoolId
                        ? this.state.schoolOptions.filter(option =>
                            this.state.schoolId.includes(option.value)
                          )
                        : []
                    }
                    options={this.state.schoolOptions}
                  />
                  <ErrorMessage
                    name="states"
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

TeacherForm.propTypes = {
  id: PropTypes.string,
  teacher: PropTypes.object,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func
}

export default withFirebase(TeacherForm)
