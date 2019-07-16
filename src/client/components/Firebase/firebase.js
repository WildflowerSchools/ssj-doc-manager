import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"
import { collectionData } from "rxfire/firestore"
import { map, take, flatMap } from "rxjs/operators"

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

    this.auth = firebase.auth()

    this.googleProvider = new firebase.auth.GoogleAuthProvider()
  }

  doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider)

  doSignOut = () => this.auth.signOut()

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then(snapshot => {
            const dbUser = snapshot.data()

            // default empty roles
            if (!dbUser.hasOwnProperty("roles")) {
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
              ...dbUser
            }

            next(authUser)
          })
          .catch(e => {
            console.log(e.message)
            fallback()
          })
      } else {
        fallback()
      }
    })

  user = uid => this.firestore.doc(`users/${uid}`)

  users = () => this.firestore.collection("users")

  document = tid => this.firestore.doc(`documents/${tid}`)

  documents = () => this.firestore.collection("documents")

  template_document = tid => this.firestore.doc(`template_documents/${tid}`)

  template_documents = () => this.firestore.collection("template_documents")

  template_documents_as_options = onLoad => {
    collectionData(this.template_documents(), "id")
      .pipe(
        take(1),
        map(tds => {
          return tds.map(td => {
            return { value: td.id, label: td.document_name }
          })
        })
      )
      .subscribe(tds => {
        onLoad(tds)
      })
  }

  school = sid => this.firestore.doc(`schools/${sid}`)

  schools = () => this.firestore.collection("schools")

  schools_as_options = onLoad => {
    collectionData(this.schools(), "id")
      .pipe(
        take(1),
        map(schools => {
          return schools.map(s => {
            return { value: s.id, label: s.name }
          })
        })
      )
      .subscribe(schools => {
        onLoad(schools)
      })
  }

  school_add_teacher = (schoolId, teacherId) => {
    let schoolRef = this.school(schoolId)
    let teacherRef = this.teacher(teacherId)

    return schoolRef
      .update({
        teachers: firebase.firestore.FieldValue.arrayUnion(teacherRef)
      })
      .catch(e => {
        console.log(e.message)
      })
  }

  school_remove_teacher = (schoolId, teacherId) => {
    let schoolRef = this.school(schoolId)
    let teacherRef = this.teacher(teacherId)

    return schoolRef
      .update({
        teachers: firebase.firestore.FieldValue.arrayRemove(teacherRef)
      })
      .catch(e => {
        console.log(e.message)
      })
  }

  teacher = tid => this.firestore.doc(`teachers/${tid}`)

  teachers = () => this.firestore.collection("teachers")

  teachers_school = (teacherId, onLoad) => {
    let teacherRef = this.teacher(teacherId)

    let schoolRef = this.schools().where(
      "teachers",
      "array-contains",
      teacherRef
    )

    collectionData(schoolRef, "id")
      .pipe(
        take(1),
        flatMap(x => x)
      )
      .subscribe(school => {
        onLoad(school.id)
      })
  }

  teachers_as_options = onLoad => {
    collectionData(this.teachers(), "id")
      .pipe(
        take(1),
        map(teachers => {
          return teachers.map(s => {
            return { value: s.id, label: s.name }
          })
        })
      )
      .subscribe(teachers => {
        onLoad(teachers)
      })
  }
}

export default Firebase
