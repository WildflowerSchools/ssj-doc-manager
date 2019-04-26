import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'

class TemplateCreateBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = { template: {} }
  }
  
  componentDidMount() {
  }
  
  create() {
    const templatesRef = this.props.firebase.firestore.collection('template_documents')
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
        <button>Add New</button>
        <ul className="alternate">{lis}</ul> 
      </div>
    );
  }
}

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const TemplateCreate = withFirebase(withAuthorization(condition)(TemplateCreateBase))
export default TemplateCreate
