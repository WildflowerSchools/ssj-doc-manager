import { Link } from 'react-router-dom'

import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization } from '../Session'
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
          <p><b>Stage:</b> {c.stage || 'unspecified'}</p>
          <p><b>States:</b> {states}</p>
          <p><b>Doc Link:</b> {doc_link}</p>
          <button>Edit</button>
        </li>
      )
    })
    
    return (
      <div>
        <h3>Templates</h3>
        <Link to={ROUTES.CREATE_TEMPLATE}>Add New</Link>
        <ul className="alternate">{lis}</ul> 
      </div>
    );
  }
}

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const TemplateList = withFirebase(withAuthorization(condition)(TemplateListBase))
export default TemplateList
