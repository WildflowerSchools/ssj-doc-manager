import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization } from '../Session'

import * as ROLES from '../../constants/roles'

class TemplateListBase extends React.Component {
  constructor() {
    super();
    this.state = { templates: [] };
  }
  
  componentDidMount() {
    const templatesRef = app.firestore().collection('template_documents')
    collectionData(templatesRef).subscribe(templates => {
      this.setState({ templates })
    });
  }
  
  render() {
    const lis = this.state.templates.map(c => {
      return
        <li key={c.id}>
          <span>{c.document_name}</span> - <a href={c.document_url}>{c.document_name}</a>
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

const TemplateList = withAuthorization(condition)(TemplateListBase)
export default TemplateList
