import firebase from 'firebase/app';
import 'firebase/firestore';

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
}

class Firebase {
  constructor() {
    firebase.initializeApp(config)
    firebase.firestore().settings({ timestampsInSnapshots: true })
    
    this.firestore = firebase.firestore()
    this.auth = firebase.auth()
    
    this.googleProvider = new firebase.auth.GoogleAuthProvider()
  }
  
  doSignInWithGoogle = () => {
    this.auth.signInWithPopup(this.googleProvider)
  }

  doSignOut = () => {
    this.auth.signOut()
  }
}

export default Firebase