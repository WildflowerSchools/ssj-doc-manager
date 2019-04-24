import { collectionData } from 'rxfire/firestore';

class App extends React.Component {
  constructor() {
    super()
    this.state = { cities: [] }
  }
  
  componentDidMount() {
    const citiesRef = app.firestore().collection('cities')
    collectionData(citiesRef).subscribe(cities => {
      this.setState({ cities });
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

export default App