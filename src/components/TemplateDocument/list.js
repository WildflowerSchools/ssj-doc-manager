import React from 'react'
import { collectionData } from 'rxfire/firestore'

import { withAuthorization } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'

class TemplateListBase extends React.Component {
  constructor(props) {
    super(props)
    this.state = { templates: [] }
  }
  
  componentDidMount() {
    const templatesRef = this.props.firebase.firestore.collection('template_documents')
    collectionData(templatesRef, 'id').subscribe(templates => {
      this.setState({ templates: templates })
    })
  }
  
  render() {
    const lis = this.state.templates.map(c => {
      return (
        <div key={c.id}>
          <p><b>Stage:</b> {c.stage || 'unspecified'}</p>
          <p><b>State:</b> {c.state || 'unspecified'}</p>
          <p><b>Doc Link:</b> <a href={c.document_url || ''}>{c.document_name || 'unspecified'}</a></p>
        </div>
      )
    })
    
    return (
      <div>
      <h3>Templates</h3>
      <div>{lis}</div> 
      </div>
    );
  }
}

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const TemplateList = withFirebase(withAuthorization(condition)(TemplateListBase))
export default TemplateList
