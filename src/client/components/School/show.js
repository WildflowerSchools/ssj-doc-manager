import React from "react"
import { docData, collectionData } from "rxfire/firestore"
import PropTypes from "prop-types"
import { withFirebase } from "../Firebase"

class SchoolDetails extends React.Component {
  constructor(props) {
    super(props)

    this.id = props.id
    this.teacherId = props.teacherId
    this.style = props.style

    this.subscription = null

    this.state = {
      school: null
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
    } else if (this.teacherId) {
      this.loadItemByTeacherId()
    }
  }

  loadItemById = () => {
    const schoolRef = this.props.firebase.school(this.id),
      school$ = docData(schoolRef, "id")

    this.unsubscribe()

    this.subscription = school$.subscribe(school => {
      this.setState({ school: school })
    })
  }

  loadItemByTeacherId = () => {
    let teacherRef = this.props.firebase.teacher(this.teacherId)

    let schoolRef = this.props.firebase
      .schools()
      .where("teachers", "array-contains", teacherRef)

    let school$ = collectionData(schoolRef, "id")

    this.unsubscribe()

    this.subscription = school$.subscribe(school => {
      if (school && school.length) {
        this.setState({ school: school[0] })
      }
    })
  }

  render = () => {
    return (
      <div style={this.style}>
        {this.state.school && <div>{this.state.school.name}</div>}
      </div>
    )
  }
}

SchoolDetails.propTypes = {
  id: PropTypes.string,
  teacherId: PropTypes.string,
  ref: PropTypes.object,
  style: PropTypes.object
}

export default withFirebase(SchoolDetails)
