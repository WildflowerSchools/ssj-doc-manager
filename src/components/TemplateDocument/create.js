import React from 'react'
import Select from 'react-select';
import { collectionData } from 'rxfire/firestore'

import { withAuthorization, isAdmin } from '../Session'
import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles'
import * as ROUTES from '../../constants/routes'
import STATES_AS_OPTIONS from '../../constants/states'
import STAGES_AS_OPTIONS from '../../constants/stages'

class TemplateCreateBase extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      error: null,
      newTemplate: {
        document_name: '',
        document_url: '',
        stage: '',
        all_states: false,
        states: []
      }
    }
  }
  
  handleSubmit() {
    return this.props.firebase.template_document().set(
      this.state.template
    )
    .then(() => {
      console.log("Created template document!")
      this.setState({ error: null })
      this.props.history.push(ROUTES.ADMIN)
    })
  }
  
  render() {
    return (
      <div>
        <h3>Create Template Document</h3>
        <form onSubmit={this.handleSubmit}>
          <label>
            Document Name:
            <input type="text" value={this.state.newTemplate.document_name} />
          </label>
          <label>
            Document URL:
            <input type="text" value={this.state.newTemplate.document_url} />
          </label>
          <label>
            Startup Journey Stage:
            <select
              value={this.state.newTemplate.stage}
              options={STAGES_AS_OPTIONS}
              isMulti={true} />
          </label>
          <label>
            Valid for All States?
            <input
              name="all_states"
              type="checkbox"
              checked={this.state.newTemplate.all_states} />
          </label>
          <label disabled={this.state.newTemplate.all_states} >
            State
            <select
              value={this.state.newTemplate.states}
              options={STATES_AS_OPTIONS}
              isMulti={true} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <button>Create</button>
      </div>
    );
  }
}

const TemplateCreatePage = withFirebase(withAuthorization(isAdmin)(TemplateCreateBase))
export default TemplateCreatePage
