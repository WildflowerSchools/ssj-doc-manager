import { google } from "googleapis"

import config from "../config"
import GDriveManager from "./driveManager"

class GClient {
  constructor() {
    const serviceAccountKey = config["GOOGLE_DEFAULT_APPLICATION_CREDENTIALS"]

    if (!serviceAccountKey) {
      process.exit(1)
    }

    this.jwt = new google.auth.JWT(
      serviceAccountKey.client_email,
      null,
      serviceAccountKey.private_key,
      ["https://www.googleapis.com/auth/drive"],
      process.env.GOOGLE_DOC_MANAGEMENT_USER
    )
  }

  async authorize() {
    console.log("Authorizing Google Service Client...")
    return await new Promise(resolve => {
      this.jwt.authorize((err, tokens) => {
        if (err) {
          console.log(err)
          resolve(false)
        } else {
          google.options({
            auth: this.jwt
          })
          console.log("Google Service Account successfully connected!")
          resolve(true)
        }
      })
    })
  }

  get driveManager() {
    return new GDriveManager()
  }
}

exports.gClient = new GClient()
