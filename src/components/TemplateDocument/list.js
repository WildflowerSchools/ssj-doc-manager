import { Link } from 'react-router-dom'

import React from 'react'
import Select from 'react-select'
import { collectionData } from 'rxfire/firestore'
import { map } from 'rxjs/operators'

import { combineLatest } from 'rxjs'

import { withAuthorization, isAdmin } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROUTES from '../../constants/routes'
import * as STAGES from '../../constants/stages'
import * as STATES from '../../constants/states'


const TemplateListFilter = ({filters, setStage, setState}) => {
  const gridContainerStyle = {
    display: 'grid',
    justifyItems: 'left',
    gridGap: '0px 10px',
    gridTemplateColumns: 'repeat(auto-fill, 200px)'
  }

  return (
    <div style={gridContainerStyle}>
      <h4><b>Filter:</b></h4>
      <label
        htmlFor="td_stage"
        style={{width: '200px', gridColumnStart: 1}}>
        Startup Journey Stage
        <Select
          id="td_stage"
          isMulti={false}
          isClearable={true}
          value={STAGES.STAGES_AS_OPTIONS ? STAGES.STAGES_AS_OPTIONS.find(option => option.value === filters.stage) : ''}
          onChange={(v) => setStage(v ? v.value : '')}
          options={STAGES.STAGES_AS_OPTIONS}/>
      </label>
      <label
        htmlFor="td_state"
        style={{width: '200px'}}>
        State
        <Select
          id="td_state"
          isMulti={false}
          isClearable={true}
          value={STATES.STATES_AS_OPTIONS ? STATES.STATES_AS_OPTIONS.find(option => option.value === filters.state) : ''}
          onChange={(v) => setState(v ? v.value : '')}
          options={STATES.STATES_AS_OPTIONS}/>
      </label>
    </div>
  )
}


class TemplateListBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      templates: [],
      filters: {
        state: '',
        stage: ''
      }
    }
  }

  refreshList = () => {
    let templatesRef = this.props.firebase.template_documents()

    if (this.state.filters.stage) {``
      templatesRef = templatesRef.where('stage', '==', this.state.filters.stage)
    }

    let templates$ = collectionData(templatesRef, 'id')

    // 'or' statements are hard in Firebase. The following is how we write a query that matches on state names and includes records with all_states == true:
    //    "if (template.state == 'MN' or template.all_states = true)"
    if (this.state.filters.state) {
      const allStatesRef = templatesRef.where("all_states", '==', true)
      const specificStateRef = templatesRef
        .where('states', 'array-contains', this.state.filters.state)
        .where("all_states", '==', false)

      const allStates$ = collectionData(allStatesRef, 'id')
      const specificState$ = collectionData(specificStateRef, 'id')

      templates$ = combineLatest([allStates$, specificState$])
        .pipe(
          map((templates) => {
            // Destructure the values to combine a single array.
            let [allStates, specificStates] = templates
            return [
              //spread the arrays out to combine as one array
              ...allStates,
              ...specificStates
            ]
          }))
    }

    templates$.subscribe(templates => {
      this.setState({ templates: templates })
    })
  }

  setStateFilter = (state) => {
    this.setState({filters: {...this.state.filters, state: state}}, this.refreshList)
  }

  setStageFilter = (stage) => {
    this.setState({filters: {...this.state.filters, stage: stage}}, this.refreshList)
  }
  
  componentDidMount() {
    this.refreshList()
  }
  
  render() {
    const lis = this.state.templates.map(c => {
      let states = c.states.map( s => STATES.STATES[s] ).join(', ')
      if (c.all_states) {
        states = 'All'
      }
      
      let doc_link = ''
      if (c.document_url) {
        doc_link = (<a target="_blank" href={c.document_url}>{c.document_name || 'unspecified'}</a>)
      }
      
      return (
        <li key={c.id}>
          <div><b>Document:</b> {doc_link}</div>
          <div>
            <span><b>Stage:</b> {STAGES.STAGES[c.stage] || ''}</span>
            <span><b>States:</b> {states}</span>
          </div>
          <button><Link to={ROUTES.adminEditTemplateWithId(c.id)}>Edit</Link></button>
        </li>
      )
    })
    
    return (
      <div>
        <h3>Templates</h3>
        <Link to={ROUTES.ADMIN_CREATE_TEMPLATE}>+ Add New</Link>
        <TemplateListFilter filters={this.state.filters} setState={this.setStateFilter} setStage={this.setStageFilter} />
        <ul className="documents alternate">{lis}</ul> 
      </div>
    )
  }
}

const TemplateList = withFirebase(withAuthorization(isAdmin)(TemplateListBase))
export default TemplateList
