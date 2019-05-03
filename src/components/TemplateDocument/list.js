import { Link } from 'react-router-dom'

import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAdmin } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'

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
      let states = c.states.join(', ');
      if (c.all_states) {
        states = 'All'
      }
      
      let doc_link = '';
      if (c.document_url) {
        doc_link = (<a href={c.document_url}>{c.document_name || 'unspecified'}</a>)
      }
      
      return (
        <li key={c.id}>
          <div><b>Document:</b> {doc_link}</div>
          <div>
            <span><b>Stage:</b> {c.stage || ''}</span>
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
        <ul className="documents alternate">{lis}</ul> 
      </div>
    )
  }
}

const TemplateList = withFirebase(withAuthorization(isAdmin)(TemplateListBase))
export default TemplateList
