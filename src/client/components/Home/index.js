import React from "react"

import { withAuthorization, isAuthenticated } from "../Session"

const HomePageBase = () => (
  <div>
    <h1>Documents</h1>
  </div>
)

const HomePage = withAuthorization(isAuthenticated)(HomePageBase)
export default HomePage
