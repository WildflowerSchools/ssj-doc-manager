import { Link } from "react-router-dom"

import React from "react"
import { collectionData } from "rxfire/firestore"

import { withAuthorization, isAdmin } from "../Session"
import { withFirebase } from "../Firebase"
import { SchoolDetails } from "../School"

import * as ROUTES from "../../constants/routes"

const TeacherListFilter = ({ filters, setSearch }) => {
  const gridContainerStyle = {
    display: "grid",
    justifyItems: "left",
    gridGap: "0px 10px",
    gridTemplateColumns: "repeat(auto-fill, 200px)"
  }

  return (
    <div style={gridContainerStyle}>
      <h4>
        <b>Filter:</b>
      </h4>
      <div style={{ width: "100%", gridColumnStart: 1, gridColumnEnd: 3 }}>
        <label htmlFor="tl_search" className="visuallyHidden">
          Search
        </label>
        <input
          id="tl_search"
          type="search"
          onChange={v => setSearch(v ? v.target.value : "")}
          placeholder="Search..."
          value={filters.search}
        />
      </div>
    </div>
  )
}

class TeacherListBase extends React.Component {
  constructor(props) {
    super(props)

    this.subscription = null

    this.state = {
      teachers: [],
      filteredTeachers: [],
      teacherSchools: {},
      filters: {
        search: ""
      }
    }
  }

  unsubscribe = () => {
    this.subscription && this.subscription.unsubscribe()
  }

  setTeacherSchool = teacherId => {
    return schoolId => {
      this.setState(prevState => ({
        teacherSchools: {
          ...prevState.teacherSchools,
          [teacherId]: schoolId
        }
      }))
    }
  }

  loadList = () => {
    let teachersRef = this.props.firebase.teachers()

    let teachers$ = collectionData(teachersRef, "id")

    this.unsubscribe()

    this.subscription = teachers$.subscribe(teachers => {
      this.setState({ teachers: teachers }, this.filterListLocally)

      teachers.forEach(t => {
        this.props.firebase.teachers_school(t.id, this.setTeacherSchool(t.id))
      })
    })
  }

  filterListLocally = () => {
    let filteredTeachers = this.state.teachers

    if (this.state.filters.search) {
      filteredTeachers = this.state.teachers.filter(t => {
        if (
          t.name
            .toLowerCase()
            .indexOf(this.state.filters.search.toLowerCase()) > -1
        ) {
          return t
        }
      })
    }

    this.setState({ filteredTeachers: filteredTeachers })
  }

  setSearchFilter = search => {
    this.setState(
      { filters: { ...this.state.filters, search: search } },
      this.filterListLocally
    )
  }

  componentDidMount() {
    this.loadList()
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const lis = this.state.filteredTeachers.map(t => {
      return (
        <li key={t.id}>
          <div>
            <b>Name:</b> {t.name}
          </div>
          <div>
            <b>School:</b>&nbsp;
            {this.state.teacherSchools[t.id] && (
              <SchoolDetails
                style={{ display: "inline-block" }}
                id={this.state.teacherSchools[t.id]}
              />
            )}
          </div>
          <button>
            <Link to={ROUTES.adminEditTeacherWithId(t.id)}>Edit</Link>
          </button>
        </li>
      )
    })

    return (
      <div>
        <button>
          <Link to={ROUTES.ADMIN_CREATE_TEACHER}>+ Add New</Link>
        </button>
        <TeacherListFilter
          filters={this.state.filters}
          setSearch={this.setSearchFilter}
        />
        <ul className="documents alternate">{lis}</ul>
      </div>
    )
  }
}

const TeacherList = withFirebase(withAuthorization(isAdmin)(TeacherListBase))
export default TeacherList
