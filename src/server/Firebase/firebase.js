import admin from "firebase-admin"

import config from "../config"

class Firebase {
  constructor() {
    const serviceAccountKey = config["FIREBASE_APPLICATION_CREDENTIALS"]

    if (!serviceAccountKey) {
      process.exit(1)
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    })

    this.firestore = admin.firestore()
    this.firestoreNS = admin.firestore
  }

  user = uid => this.firestore.doc(`users/${uid}`)

  users = () => this.firestore.collection("users")

  document = tid => this.firestore.doc(`documents/${tid}`)

  documents = () => this.firestore.collection("documents")

  template_document = tid => this.firestore.doc(`template_documents/${tid}`)

  template_documents = () => this.firestore.collection("template_documents")

  school = sid => this.firestore.doc(`schools/${sid}`)

  schools = () => this.firestore.collection("schools")

  teacher = tid => this.firestore.doc(`teachers/${tid}`)

  teachers = () => this.firestore.collection("teachers")
}

exports.firebase = new Firebase()
