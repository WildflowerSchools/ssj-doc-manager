import React from "react";
import ReactDOM from "react-dom";
import firebase from 'firebase/app';
import 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';

const app = firebase.initializeApp(
  { projectId: 'ssj-document-manager' }
);
app.firestore().settings({ timestampsInSnapshots: true });

class App extends React.Component {
  
  constructor() {
    super();
    this.state = { cities: [] };
  }
  
  componentDidMount() {
    const citiesRef = app.firestore().collection('cities');
    collectionData(citiesRef).subscribe(cities => {
      this.setState({ cities });
    });
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

ReactDOM.render(<App />, document.getElementById("root"));
