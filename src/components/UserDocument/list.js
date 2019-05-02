import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAuthenticated } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'

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

      let doc_link = '';
      if (c.document_url) {
        doc_link = (<a href={c.document_url}>{c.document_name || 'unspecified'}</a>)
      }
      
      return (
        <li className="document" key={c.id}>
          <div><b>Document:</b> {doc_link}</div>
          <div>
            <span><b>Stage:</b> {c.stage || ''}</span>
          </div>
          <button>Edit</button>
        </li>
      )
    })
    
    return (
      <div>
        <h3>My Documents</h3>
        <ul className="alternate">{lis}</ul> 
      </div>
    );
  }
}

const UserDocumentList = withFirebase(withAuthorization(isAuthenticated)(UserDocumentListBase))
export default UserDocumentList
