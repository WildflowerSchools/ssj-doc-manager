import React from "react"
import ReactDOM from "react-dom"
import ReactModal from "react-modal"

import * as serviceWorker from "./serviceWorker"

import App from "./components/App"
import Firebase, { FirebaseContext } from "./components/Firebase"

ReactModal.setAppElement("#root")

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <App />
  </FirebaseContext.Provider>,
  document.getElementById("root")
)

serviceWorker.unregister()
