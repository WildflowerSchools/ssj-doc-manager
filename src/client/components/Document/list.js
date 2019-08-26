import ClickAwayListener from "@material-ui/core/ClickAwayListener"
import Clipboard from "react-clipboard.js"
import FileCopy from "@material-ui/icons/FileCopy"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import React from "react"
import Select from "react-select"
import { collectionData } from "rxfire/firestore"
import { map } from "rxjs/operators"
import { combineLatest } from "rxjs"

import { withFirebase } from "../Firebase"
import { withAuthorization, isAdmin } from "../Session"
import { SchoolDetails } from "../School"
import { TeacherDetails } from "../Teacher"
import { OrderBy } from "../Util"

import * as STAGES from "../../constants/stages"
import { Link } from "react-router-dom"
import * as ROUTES from "../../constants/routes"

class DocumentListFilterBase extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      templateDocumentOptions: [],
      schoolOptions: [],
      teacherOptions: [],
      templateDocumentId: "",
      schoolId: "",
      teacherId: ""
    }

    this.props.firebase.template_documents_as_options(this.setTemplateDocuments)
    this.props.firebase.schools_as_options(this.setSchools)
    this.props.firebase.teachers_as_options(this.setTeachers)
  }

  setTemplateDocuments = options => {
    this.setState({ templateDocumentOptions: options })
  }

  setTemplateDocumentId = templateDocumentId => {
    this.setState(
      { templateDocumentId: templateDocumentId },
      this.props.setTemplateDocument(templateDocumentId)
    )
  }

  setSchools = options => {
    this.setState({ schoolOptions: options })
  }

  setSchoolId = schoolId => {
    this.setState({ schoolId: schoolId }, this.props.setSchool(schoolId))
  }

  setTeachers = options => {
    this.setState({ teacherOptions: options })
  }

  setTeacherId = teacherId => {
    this.setState({ teacherId: teacherId }, this.props.setTeacher(teacherId))
  }

  render() {
    const {
      firebase,
      filters,
      setSearch,
      setStage,
      setState,
      setTeacher,
      setSchool
    } = this.props

    const filterGridContainerStyle = {
      display: "grid",
      justifyItems: "left",
      gridGap: "5px 10px",
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
        <label
          htmlFor="td_template"
          style={{ width: "100%", gridColumnStart: 1, gridColumnEnd: 3 }}
        >
          Template
          <Select
            id="td_template"
            isMulti={false}
            isClearable={true}
            value={
              this.state.templateDocumentOptions &&
              this.state.templateDocumentId
                ? this.state.templateDocumentOptions.filter(
                    option => this.state.templateDocumentId === option.value
                  )
                : ""
            }
            onChange={v => this.setTemplateDocumentId(v ? v.value : "")}
            options={this.state.templateDocumentOptions}
          />
        </label>
        <label
          htmlFor="td_stage"
          style={{ width: "200px", gridColumnStart: 1 }}
        >
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
        {/*  Disabling state filter on documents for now because I think it could be confusing
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
        */}
        <label htmlFor="td_school" style={{ width: "200px" }}>
          School
          <Select
            id="td_school"
            isMulti={false}
            isClearable={true}
            value={
              this.state.schoolOptions && this.state.schoolId
                ? this.state.schoolOptions.filter(
                    option => this.state.schoolId === option.value
                  )
                : ""
            }
            onChange={v => this.setSchoolId(v ? v.value : "")}
            options={this.state.schoolOptions}
          />
        </label>
        <label htmlFor="td_teacher" style={{ width: "200px" }}>
          Teacher
          <Select
            id="td_teacher"
            isMulti={false}
            isClearable={true}
            value={
              this.state.teacherOptions && this.state.teacherId
                ? this.state.teacherOptions.filter(
                    option => this.state.teacherId === option.value
                  )
                : ""
            }
            onChange={v => this.setTeacherId(v ? v.value : "")}
            options={this.state.teacherOptions}
          />
        </label>
      </div>
    )
  }
}

const DocumentListFilter = withFirebase(DocumentListFilterBase)

class TemplateListBase extends React.Component {
  constructor(props) {
    super(props)

    this.subscription = null

    this.state = {
      documents: [],
      filteredDocuments: [],
      filters: {
        search: "",
        state: "",
        stage: "",
        school: "",
        teacher: ""
      },
      tooltipCopy: "",
      orderBy: "",
      orderDirection: "asc"
    }
  }

  unsubscribe = () => {
    this.subscription && this.subscription.unsubscribe()
  }

  refreshList = () => {
    let dQuery = this.props.firebase.documents()
    if (this.state.orderBy) {
      dQuery = dQuery.orderBy(this.state.orderBy, this.state.orderDirection)
    }

    if (this.state.filters.template_document) {
      dQuery = dQuery.where(
        "template_document",
        "==",
        this.props.firebase.template_document(
          this.state.filters.template_document
        )
      )
    }
    if (this.state.filters.stage) {
      dQuery = dQuery.where("stage", "==", this.state.filters.stage)
    }
    if (this.state.filters.school) {
      dQuery = dQuery.where(
        "owner",
        "==",
        this.props.firebase.school(this.state.filters.school)
      )
    }
    if (this.state.filters.teacher) {
      dQuery = dQuery.where(
        "owner",
        "==",
        this.props.firebase.teacher(this.state.filters.teacher)
      )
    }

    let documents$ = collectionData(dQuery, "id")

    // 'or' statements are hard in Firebase. The following is how we write a query that matches on state names and includes records with all_states == true:
    //    "if (template.state == 'MN' or template.all_states = true)"
    if (this.state.filters.state) {
      const allStatesQuery = dQuery.where("all_states", "==", true)
      const specificStateQuery = dQuery
        .where("states", "array-contains", this.state.filters.state)
        .where("all_states", "==", false)

      const allStates$ = collectionData(allStatesQuery, "id")
      const specificState$ = collectionData(specificStateQuery, "id")

      documents$ = combineLatest([allStates$, specificState$]).pipe(
        map(documents => {
          // Destructure the values to combine a single array.
          let [allStates, specificStates] = documents
          return [
            //spread the arrays out to combine as one array
            ...allStates,
            ...specificStates
          ]
        })
      )
    }

    this.unsubscribe()

    this.subscription = documents$.subscribe(documents => {
      this.setState({ documents: documents }, this.filterListLocally)
    })
  }

  filterListLocally = () => {
    let filtered = this.state.documents

    if (this.state.filters.search) {
      filtered = this.state.documents.filter(t => {
        if (
          t.document_name
            .toLowerCase()
            .indexOf(this.state.filters.search.toLowerCase()) > -1
        ) {
          return t
        }
      })
    }

    this.setState({ filteredDocuments: filtered })
  }

  setSearchFilter = search => {
    this.setState(
      { filters: { ...this.state.filters, search: search } },
      this.filterListLocally
    )
  }

  setTemplateDocument = template_document => {
    this.setState(
      {
        filters: { ...this.state.filters, template_document: template_document }
      },
      this.refreshList
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

  setSchoolFilter = school => {
    this.setState(
      { filters: { ...this.state.filters, school: school } },
      this.refreshList
    )
  }

  setTeacherFilter = teacher => {
    this.setState(
      { filters: { ...this.state.filters, teacher: teacher } },
      this.refreshList
    )
  }

  setOrderBy = (orderBy, direction) => {
    this.setState(
      { orderBy: orderBy, orderDirection: direction },
      this.refreshList
    )
  }

  handleTooltipClose = () => {
    this.setState({ tooltipCopy: null })
  }

  handleTooltipOpen = documentId => {
    this.setState({ tooltipCopy: documentId })
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
        gridTemplateColumns: "auto"
      },
      listGridDetailsColumnStyle = {
        width: "auto"
      }

    const lis = this.state.filteredDocuments
      .filter(fd => fd.document_url)
      .map(fd => {
        /*let states = fd.states.map(s => STATES.STATES[s]).join(", ")
      if (fd.all_states) {
        states = "All"
      }*/

        let doc_link = ""
        if (fd.document_url) {
          doc_link = (
            <a
              target="_blank"
              href={fd.document_url}
              className="permanent-link-color"
            >
              {fd.document_name || "unspecified"}
            </a>
          )
        }

        return (
          <li key={fd.id} style={listGridContainerStyle}>
            <div style={listGridDetailsColumnStyle}>
              <div style={{ padding: "5px 0" }}>
                <b>Document:</b> {doc_link}
                <ClickAwayListener
                  onClickAway={this.handleTooltipClose}
                  mouseEvent={
                    this.state.tooltipCopy === fd.id ? "onClick" : false
                  }
                >
                  <span>
                    <Clipboard
                      className="clickable"
                      component="span"
                      data-clipboard-text={fd.document_url}
                      onSuccess={() => {
                        this.handleTooltipOpen(fd.id)
                      }}
                      title="Copy URL"
                    >
                      <Tooltip
                        PopperProps={{
                          disablePortal: true
                        }}
                        onClose={this.handleTooltipClose}
                        open={this.state.tooltipCopy === fd.id}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        title="Copied!"
                      >
                        <IconButton
                          size="small"
                          key="file-copy"
                          aria-label="Copy"
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Clipboard>
                  </span>
                </ClickAwayListener>
              </div>
              <div style={{ padding: "5px 0" }}>
                {fd.owner && fd.owner.path.startsWith("teachers/") && (
                  <div>
                    <b>Owner (teacher):</b>&nbsp;
                    <TeacherDetails
                      style={{ display: "inline-block" }}
                      id={fd.owner.id}
                    />
                  </div>
                )}
                {fd.owner && fd.owner.path.startsWith("schools/") && (
                  <div>
                    <b>Owner (school):</b>&nbsp;
                    <SchoolDetails
                      style={{ display: "inline-block" }}
                      id={fd.owner.id}
                    />
                  </div>
                )}
              </div>
              <div style={{ padding: "5px 0" }}>
                <span>
                  <b>Stage:</b> {STAGES.STAGES[fd.stage] || ""}
                </span>
              </div>
            </div>
          </li>
        )
      })

    return (
      <div>
        <button>
          <Link to={ROUTES.ADMIN_UPLOAD_DOCUMENT}>+ Upload Document</Link>
        </button>
        <DocumentListFilter
          filters={this.state.filters}
          setSearch={this.setSearchFilter}
          setTemplateDocument={this.setTemplateDocument}
          setState={this.setStateFilter}
          setStage={this.setStageFilter}
          setSchool={this.setSchoolFilter}
          setTeacher={this.setTeacherFilter}
        />
        <OrderBy
          setOrderBy={this.setOrderBy}
          fields={[
            { name: "document_name", public: "Name" },
            { name: "stage", public: "Stage" }
          ]}
        />
        <ul className="documents alternate">{lis}</ul>
      </div>
    )
  }
}

const DocumentList = withFirebase(withAuthorization(isAdmin)(TemplateListBase))
export default DocumentList
