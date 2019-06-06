import React from "react"

import { withAuthorization, isAdmin } from "../Session"
import { TemplateList } from "../TemplateDocument"
import { DocumentList } from "../Document"
import { TeacherList } from "../Teacher"
import { SchoolList } from "../School"

const TAB = {
  TEMPLATES: "TEMPLATES",
  DOCUMENTS: "DOCUMENTS",
  SCHOOLS: "SCHOOLS",
  TEACHERS: "TEACHERS"
}

class AdminPageBase extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tab: TAB.TEMPLATES
    }
  }

  setTab = tab => {
    this.setState({ tab: tab })
  }

  render() {
    return (
      <div>
        <ul className="horizontal">
          <li>
            <a
              href="#templates"
              className={this.state.tab === TAB.TEMPLATES ? "active" : ""}
              onClick={() => this.setTab(TAB.TEMPLATES)}
            >
              Templates
            </a>
          </li>
          <li>
            <a
              href="#documents"
              className={this.state.tab === TAB.DOCUMENTS ? "active" : ""}
              onClick={() => this.setTab(TAB.DOCUMENTS)}
            >
              Documents
            </a>
          </li>
          <li>
            <a
              href="#schools"
              className={this.state.tab === TAB.SCHOOLS ? "active" : ""}
              onClick={() => this.setTab(TAB.SCHOOLS)}
            >
              Schools
            </a>
          </li>
          <li>
            <a
              href="#teachers"
              className={this.state.tab === TAB.TEACHERS ? "active" : ""}
              onClick={() => this.setTab(TAB.TEACHERS)}
            >
              Teachers
            </a>
          </li>
        </ul>

        <div>
          {
            {
              [TAB.TEMPLATES]: (
                <div>
                  <h1>Template Library</h1>
                  <TemplateList />
                </div>
              ),
              [TAB.DOCUMENTS]: (
                <div>
                  <h1>Documents</h1>
                  <DocumentList />
                </div>
              ),
              [TAB.SCHOOLS]: (
                <div>
                  <h1>Schools</h1>
                  <SchoolList />
                </div>
              ),
              [TAB.TEACHERS]: (
                <div>
                  <h1>Teachers</h1>
                  <TeacherList />
                </div>
              )
            }[this.state.tab]
          }
        </div>
      </div>
    )
  }
}

const AdminPage = withAuthorization(isAdmin)(AdminPageBase)
export default AdminPage
