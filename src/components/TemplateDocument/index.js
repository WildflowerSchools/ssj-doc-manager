import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization } from '../Session'

import * as ROLES from '../../constants/roles'

const TemplatePageBase = () => (
  <div>
    <h1>Template Document Page</h1>
    <p>The Admin Page is only accessible by the admins.</p>
  </div>
);

class TemplatePageBase extends React.Component {
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
      return <li key={c.id}>{c.name} - {c.temperature}</li> 
    });                               
    return (
      <div>
      <h1>Template Document Page</h1>
      <p>The Admin Page is only accessible by the admins.</p>
        <ul>{lis}</ul>  
      </div>
    );
  }
}

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const TemplatePage = withAuthorization(condition)(TemplatePageBase)
export default TemplatePage
