import React from "react"
import { docData } from "rxfire/firestore"
import PropTypes from "prop-types"
import { withFirebase } from "../Firebase"

class TeacherDetails extends React.Component {
  constructor(props) {
    super(props)

    this.id = props.id
    this.style = props.style

    this.subscription = null

    this.state = {
      teacher: null
    }
  }

  unsubscribe = () => {
    this.subscription && this.subscription.unsubscribe()
  }

  componentDidMount() {
    this.loadItem()
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  loadItem = () => {
    if (this.id) {
      this.loadItemById()
    }
  }

  loadItemById = () => {
    const teacherRef = this.props.firebase.teacher(this.id),
      teacher$ = docData(teacherRef, "id")

    this.unsubscribe()

    this.subscription = teacher$.subscribe(teacher => {
      this.setState({ teacher: teacher })
    })
  }

  render = () => {
    return (
      <div style={this.style}>
        {this.state.teacher && <div>{this.state.teacher.name}</div>}
      </div>
    )
  }
}

TeacherDetails.propTypes = {
  id: PropTypes.string,
  style: PropTypes.object
}

export default withFirebase(TeacherDetails)
