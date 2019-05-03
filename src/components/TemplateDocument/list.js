import { Link } from 'react-router-dom'

import React from 'react'
import Select from 'react-select';
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAdmin } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'
import * as STAGES from '../../constants/stages'
import * as STATES from '../../constants/states'

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
  
  refresh = () => {
    const templatesRef = this.props.firebase.template_documents()
    if (this.state.filters.state) {
      templatesRef.where('state', '==', this.state.filters.state)
    }
    if (this.state.filters.stage) {
      templatesRef.where('stage', '==', this.state.filters.stage)
    }
    
    collectionData(templatesRef, 'id').subscribe(templates => {
      this.setState({ templates: templates })
    })
  }
  
  componentDidMount() {
    const templatesRef = this.props.firebase.template_documents()
    if (this.state.filters.state) {
      templatesRef.where('state', '==', this.state.filters.state)
    }
    if (this.state.filters.stage) {
      templatesRef.where('stage', '==', this.state.filters.stage)
    }
    
    collectionData(templatesRef, 'id').subscribe(templates => {
      this.setState({ templates: templates })
    })
  }
  
  render() {
    const lis = this.state.templates.map(c => {
      let states = c.states.map( s => STATES.STATES[s] ).join(', ');
      if (c.all_states) {
        states = 'All'
      }
      
      let doc_link = '';
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
        <div>
          <h4><b>Filter:</b></h4>
          <label htmlFor="td_stage">
            Startup Journey Stage
            <Select
              id="td_stage"
              isMulti={false}
              isClearable={true}
              value={this.state.filters.stage}
              onChange={ (v) => this.setState( { filters: { ...this.state.filters, stage: v } }) }
              options={STAGES.STAGES_AS_OPTIONS} />
          </label>
          <label htmlFor="td_state">
            State
            <Select
              id="td_state"
              isMulti={false}
              isClearable={true}
              value={this.state.filters.state}
              onChange={ (v) => this.setState( { filters: { ...this.state.filters, state: v } }) }
              options={STATES.STATES_AS_OPTIONS} />
          </label>
        </div>
        <ul className="documents alternate">{lis}</ul> 
      </div>
    )
  }
}

const TemplateList = withFirebase(withAuthorization(isAdmin)(TemplateListBase))
export default TemplateList
