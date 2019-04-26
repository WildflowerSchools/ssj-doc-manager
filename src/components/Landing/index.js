import React from 'react'
import { UserDocumentList } from '../UserDocument'

const LandingPageBase = () => (
  <div>
    <h1>Landing Page</h1>
    <p>The Landing Page is accessible by everyone</p>
    <UserDocumentList />
  </div>
)

const LandingPage = LandingPageBase
export default LandingPage