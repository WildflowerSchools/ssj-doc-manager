import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAuthenticated } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'
import * as STAGES from '../../constants/stages'

class UserDocumentListBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = { templates: [] }
  }
  
  componentDidMount() {
    const templatesRef = this.props.firebase.firestore.collection('user_documents')
    collectionData(templatesRef, 'id').subscribe(templates => {
      this.setState({ templates: templates })
    })
  }
  
  render() {
    const lis = this.state.templates.map(c => {

      let doc_link = ''
      if (c.document_url) {
        doc_link = (<a target="_blank" href={c.document_url}>{c.document_name || 'unspecified'}</a>)
      }
      
      return (
        <li key={c.id}>
          <div><b>Document:</b> {doc_link}</div>
          <div>
            <span><b>Stage:</b> {STAGES.STAGES[c.stage] || ''}</span>
          </div>
          <button>Edit</button>
        </li>
      )
    })
    
    return (
      <div>
        <h3>My Documents</h3>
        <ul className="documents alternate">{lis}</ul> 
      </div>
    )
  }
}

const UserDocumentList = withFirebase(withAuthorization(isAuthenticated)(UserDocumentListBase))
export default UserDocumentList
