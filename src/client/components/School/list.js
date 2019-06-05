import { Link } from "react-router-dom"

import React from "react"
import { collectionData } from "rxfire/firestore"

import { withAuthorization, isAdmin } from "../Session"
import { withFirebase } from "../Firebase"
import { TeacherDetails } from "../Teacher"

import * as ROUTES from "../../constants/routes"

const SchoolListFilter = ({ filters, setSearch }) => {
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

class SchoolListBase extends React.Component {
  constructor(props) {
    super(props)

    this.subscription = null

    this.state = {
      schools: [],
      filteredSchools: [],
      filters: {
        search: ""
      }
    }
  }

  unsubscribe = () => {
    this.subscription && this.subscription.unsubscribe()
  }

  loadList = () => {
    let schoolsRef = this.props.firebase.schools()

    let schools$ = collectionData(schoolsRef, "id")

    this.unsubscribe()

    this.subscription = schools$.subscribe(schools => {
      this.setState({ schools: schools }, this.filterListLocally)
    })
  }

  filterListLocally = () => {
    let filteredSchools = this.state.schools

    if (this.state.filters.search) {
      filteredSchools = this.state.schools.filter(t => {
        if (
          t.name
            .toLowerCase()
            .indexOf(this.state.filters.search.toLowerCase()) > -1
        ) {
          return t
        }
      })
    }

    this.setState({ filteredSchools: filteredSchools })
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
    const lis = this.state.filteredSchools.map(s => {
      return (
        <li key={s.id}>
          <div>
            <b>Name:</b> {s.name}
          </div>
          <div>
            <b>Teachers:</b>
            <ul>
              {s.teachers &&
                s.teachers.map(t => {
                  return (
                    <li key={t.id}>
                      <TeacherDetails id={t.id} />
                    </li>
                  )
                })}
            </ul>
          </div>
          <button>
            <Link to={ROUTES.adminEditSchoolWithId(s.id)}>Edit</Link>
          </button>
        </li>
      )
    })

    return (
      <div>
        <button>
          <Link to={ROUTES.ADMIN_CREATE_SCHOOL}>+ Add New</Link>
        </button>
        <SchoolListFilter
          filters={this.state.filters}
          setSearch={this.setSearchFilter}
        />
        <ul className="documents alternate">{lis}</ul>
      </div>
    )
  }
}

const SchoolList = withFirebase(withAuthorization(isAdmin)(SchoolListBase))
export default SchoolList
