import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

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
    
    this.firestore = firebase.firestore()
    this.firestore.settings({ timestampsInSnapshots: true })
    
    this.auth = firebase.auth()
    
    this.googleProvider = new firebase.auth.GoogleAuthProvider()
  }
  
  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider)

  doSignOut = () =>
    this.auth.signOut()
  
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then(snapshot => {
            const dbUser = snapshot.data()

            // default empty roles
            if (!dbUser.hasOwnProperty('roles')) {
              dbUser.roles = {}
              
              this.user(authUser.uid).update({
                roles: {}
              })
            }
          
            if (!dbUser.roles) {
              dbUser.roles = {}
            }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            }

            next(authUser)
          });
      } else {
        fallback()
      }
    })

  user = uid => this.firestore.doc(`users/${uid}`)

  users = () => this.firestore.collection('users')

  template_document = tid => this.firestore.doc(`template_documents/${tid}`)

  template_documents = () => this.firestore.collection('template_documents')
}


export default Firebase