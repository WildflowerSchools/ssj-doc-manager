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
  
  handleSubmit() {
    
    return this.props.firebase.template_document().set(
      this.state.template
    )
  }
  
  render() {
    return (
      <div>
        <h3>Create Template Document</h3>
        <form onSubmit={this.handleSubmit>
          <label>
            Name:
            <input type="text" value={this.state.value} />
          </label>
          <label>
            Name:
            <input type="text" value={this.state.value} />
          </label>
          <label>
            Name:
            <input type="text" value={this.state.value} />
          </label>
        
          <input type="submit" value="Submit" />
        </form>
        <button>Create</button>
      </div>
    );
  }
}

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN]

const TemplateCreate = withFirebase(withAuthorization(condition)(TemplateCreateBase))
export default TemplateCreate
