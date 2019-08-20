import { Link } from "react-router-dom"

import React from "react"
import Select from "react-select"
import { collectionData } from "rxfire/firestore"
import { map } from "rxjs/operators"
import { combineLatest } from "rxjs"

import { CreateModal } from "../CopyDocuments"
import { withAuthorization, isAdmin } from "../Session"
import { withFirebase } from "../Firebase"
import { OrderBy } from "../Util"

import * as ROUTES from "../../constants/routes"
import * as STAGES from "../../constants/stages"
import * as STATES from "../../constants/states"

const TemplateListFilter = ({ filters, setSearch, setStage, setState }) => {
  const filterGridContainerStyle = {
    display: "grid",
    justifyItems: "left",
    gridGap: "0px 10px",
    gridTemplateColumns: "repeat(auto-fill, 200px)"
  }

  return (
    <div style={filterGridContainerStyle}>
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
      <label htmlFor="td_stage" style={{ width: "200px", gridColumnStart: 1 }}>
        Startup Journey Stage
        <Select
          id="td_stage"
          isMulti={false}
          isClearable={true}
          value={
            STAGES.STAGES_AS_OPTIONS
              ? STAGES.STAGES_AS_OPTIONS.find(
                  option => option.value === filters.stage
                )
              : ""
          }
          onChange={v => setStage(v ? v.value : "")}
          options={STAGES.STAGES_AS_OPTIONS}
        />
      </label>
      <label htmlFor="td_state" style={{ width: "200px" }}>
        State
        <Select
          id="td_state"
          isMulti={false}
          isClearable={true}
          value={
            STATES.STATES_AS_OPTIONS
              ? STATES.STATES_AS_OPTIONS.find(
                  option => option.value === filters.state
                )
              : ""
          }
          onChange={v => setState(v ? v.value : "")}
          options={STATES.STATES_AS_OPTIONS}
        />
      </label>
    </div>
  )
}

class TemplateListBase extends React.Component {
  constructor(props) {
    super(props)

    this.subscription = null

    this.state = {
      templates: [],
      filteredTemplates: [],
      checkedTemplates: new Map(),
      showCreateCopyModal: false,
      filters: {
        search: "",
        state: "",
        stage: ""
      },
      orderBy: "",
      orderDirection: "asc"
    }
  }

  unsubscribe = () => {
    this.subscription && this.subscription.unsubscribe()
  }

  refreshList = () => {
    let templatesQuery = this.props.firebase.template_documents()
    if (this.state.orderBy) {
      templatesQuery = templatesQuery.orderBy(
        this.state.orderBy,
        this.state.orderDirection
      )
    }

    if (this.state.filters.stage) {
      templatesQuery = templatesQuery.where(
        "stage",
        "==",
        this.state.filters.stage
      )
    }

    let templates$ = collectionData(templatesQuery, "id")

    // 'or' statements are hard in Firebase. The following is how we write a query that matches on state names and includes records with all_states == true:
    //    "if (template.state == 'MN' or template.all_states = true)"
    if (this.state.filters.state) {
      const allStatesQuery = templatesQuery.where("all_states", "==", true)
      const specificStateQuery = templatesQuery
        .where("states", "array-contains", this.state.filters.state)
        .where("all_states", "==", false)

      const allStates$ = collectionData(allStatesQuery, "id")
      const specificState$ = collectionData(specificStateQuery, "id")

      templates$ = combineLatest([allStates$, specificState$]).pipe(
        map(templates => {
          // Destructure the values to combine a single array.
          let [allStates, specificStates] = templates
          return [
            //spread the arrays out to combine as one array
            ...allStates,
            ...specificStates
          ]
        })
      )
    }

    this.unsubscribe()

    this.subscription = templates$.subscribe(templates => {
      this.setState({ templates: templates }, this.filterListLocally)
    })
  }

  filterListLocally = () => {
    let filteredTemplates = this.state.templates

    if (this.state.filters.search) {
      filteredTemplates = this.state.templates.filter(t => {
        if (
          t.document_name
            .toLowerCase()
            .indexOf(this.state.filters.search.toLowerCase()) > -1
        ) {
          return t
        }
      })
    }

    this.setState({ filteredTemplates: filteredTemplates })
  }

  setSearchFilter = search => {
    this.setState(
      { filters: { ...this.state.filters, search: search } },
      this.filterListLocally
    )
  }

  setStateFilter = state => {
    this.setState(
      { filters: { ...this.state.filters, state: state } },
      this.refreshList
    )
  }

  setStageFilter = stage => {
    this.setState(
      { filters: { ...this.state.filters, stage: stage } },
      this.refreshList
    )
  }

  setOrderBy = (orderBy, direction) => {
    this.setState(
      { orderBy: orderBy, orderDirection: direction },
      this.refreshList
    )
  }

  toggleTemplateListItem = e => {
    const item = e.target.name
    const isChecked = e.target.checked

    this.setState(prevState => ({
      checkedTemplates: prevState.checkedTemplates.set(item, isChecked)
    }))
  }

  countCheckedTemplates = () => {
    return Array.from(this.state.checkedTemplates.entries()).reduce(
      (ii, [_, value]) => {
        return value ? ++ii : ii
      },
      0
    )
  }

  clearCheckedTemplates = e => {
    e.preventDefault()
    this.setState({ checkedTemplates: new Map() })
  }

  checkedTemplateIds = () => {
    return Array.from(this.state.checkedTemplates.entries())
      .filter(([_, value]) => {
        return value
      })
      .map(([key, _]) => {
        return key
      })
  }

  makeCopies = () => {
    this.setState({ showCreateCopyModal: true })
  }

  closeCopyModal = () => {
    this.setState({ showCreateCopyModal: false })
  }

  componentDidMount() {
    this.refreshList()
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const listGridContainerStyle = {
        display: "grid",
        justifyItems: "left",
        gridGap: "0px 10px",
        gridTemplateColumns: "50px auto"
      },
      listGridCheckboxColumnStyle = {
        justifySelf: "center",
        alignSelf: "center",
        width: "auto",
        gridColumn: "1/2"
      },
      listGridDetailsColumnStyle = {
        width: "auto",
        gridColumn: "2/2"
      }

    const lis = this.state.filteredTemplates
      .filter(fd => fd.states && fd.document_url)
      .map(fd => {
        let states = fd.states.map(s => STATES.STATES[s]).join(", ")
        if (fd.all_states) {
          states = "All"
        }

        let doc_link = ""
        if (fd.document_url) {
          doc_link = (
            <a target="_blank" href={fd.document_url} className="permanent-link-color">
              {fd.document_name || "unspecified"}
            </a>
          )
        }

        return (
          <li key={fd.id} style={listGridContainerStyle}>
            <div style={listGridCheckboxColumnStyle}>
              <input
                name={fd.id}
                checked={this.state.checkedTemplates.get(fd.id) || false}
                style={{ fontSize: "2em" }}
                type="checkbox"
                onChange={this.toggleTemplateListItem}
              />
            </div>
            <div style={listGridDetailsColumnStyle}>
              <div style={{ padding: "5px 0" }}>
                <b>Template:</b> {doc_link}
              </div>
              <div style={{ padding: "5px 0" }}>
                <span>
                  <b>Stage:</b> {STAGES.STAGES[fd.stage] || ""}
                </span>
                <span style={{ marginLeft: "20px" }}>
                  <b>States:</b> {states}
                </span>
              </div>
              <div style={{ padding: "5px 0" }}>
                <b>Copies:</b> {fd.documents ? fd.documents.length : 0}
              </div>
              <button>
                <Link to={ROUTES.adminEditTemplateWithId(fd.id)}>Edit</Link>
              </button>
            </div>
          </li>
        )
      })

    return (
      <div>
        <button>
          <Link to={ROUTES.ADMIN_CREATE_TEMPLATE}>+ Add New</Link>
        </button>
        <TemplateListFilter
          filters={this.state.filters}
          setSearch={this.setSearchFilter}
          setState={this.setStateFilter}
          setStage={this.setStageFilter}
        />
        <OrderBy
          setOrderBy={this.setOrderBy}
          fields={[
            { name: "document_name", public: "Name" },
            { name: "stage", public: "Stage" }
          ]}
        />
        <div style={{ margin: "10px 0" }}>
          <span>
            <button
              disabled={this.countCheckedTemplates() === 0}
              onClick={this.makeCopies}
            >
              Make Copy ({this.countCheckedTemplates()} items)
            </button>
          </span>
          <span style={{ marginLeft: "20px" }}>
            <a href="#" onClick={this.clearCheckedTemplates}>
              clear
            </a>
          </span>
        </div>
        <ul className="documents alternate">{lis}</ul>

        {this.state.showCreateCopyModal === true && (
          <CreateModal
            isOpen={this.state.showCreateCopyModal}
            onRequestClose={this.closeCopyModal}
            templates={this.checkedTemplateIds()}
          />
        )}
      </div>
    )
  }
}

const TemplateList = withFirebase(withAuthorization(isAdmin)(TemplateListBase))
export default TemplateList
