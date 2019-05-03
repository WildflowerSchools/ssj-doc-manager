import { Link } from 'react-router-dom'

import React from 'react'
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
    this.state = { templates: [] }
  }
  
  componentDidMount() {
    const templatesRef = this.props.firebase.template_documents()
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
          <span><b>Filter:</b></span>
          <label htmlFor="td_stage">
            Startup Journey Stage
            <Select
              id="td_stage"
              isMulti={false}
              isClearable={true}
              value={STAGES_AS_OPTIONS ? STAGES_AS_OPTIONS.find(option => option.value === field.value) : ''}
              onChange={(option) => setFieldValue(field.name, (option === null ? '' : option.value) )}
              onBlur={field.onBlur}
              options={STAGES_AS_OPTIONS} />
          </label>
          <label htmlFor="td_stage">
            <Select
              id="td_state"
              isMulti={false}
              isClearable={true}
              value={STAGES_AS_OPTIONS ? STAGES_AS_OPTIONS.find(option => option.value === field.value) : ''}
              onChange={(option) => setFieldValue(field.name, (option === null ? '' : option.value) )}
              onBlur={field.onBlur}
              options={STAGES_AS_OPTIONS} />
          </label>
        </div>
        <ul className="documents alternate">{lis}</ul> 
      </div>
    )
  }
}

const TemplateList = withFirebase(withAuthorization(isAdmin)(TemplateListBase))
export default TemplateList
