import React from 'react'

import { collectionData } from 'rxfire/firestore'
import { withFirebase } from '../Firebase'

class AppBase extends React.Component {
  constructor() {
    super()
    this.state = { cities: [] }
  }
  
  componentDidMount() {
    const citiesRef = this.props.firebase.firestore.collection('cities')
    collectionData(citiesRef).subscribe(cities => {
      this.setState({ cities })
    })
  }
  
  render() {
    const lis = this.state.cities.map(c => {
      return <li key={c.id}>{c.name} - {c.temperature}</li> 
    });                               
    return (
      <ul>{lis}</ul>  
    );
  } 
}

const App = withFirebase(AppBase)

export default App