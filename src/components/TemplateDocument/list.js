import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'

class TemplateListBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { templates: [] };
  }
  
  componentDidMount() {
    const templatesRef = this.props.firebase.firestore.collection('template_documents')
    collectionData(templatesRef).subscribe(templates => {
      this.setState({ templates })
    });
  }
  
  render() {
    const lis = this.state.templates.map(c => {
      return
        <li key={c.id}>
          <span>{c.stage}</span> - <a href={c.document_url}>{c.document_name}</a>
        </li>
    })
    return (
      <div>
      <h1>Template Document Page</h1>
      <p>This page is only accessible by the admins.</p>
      <ul>{lis}</ul> 
      </div>
    );
  }
}

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const TemplateList = withFirebase(withAuthorization(condition)(TemplateListBase))
export default TemplateList
