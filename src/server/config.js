import path from "path"

const loadJSONOrFileEnv = env_var => {
  const v = process.env[env_var]

  try {
    return JSON.parse(v)
  } catch (e) {}

  try {
    return require(v)
  } catch (e) {}

  console.error(`Unable to load env var: ${env_var}`)
  return null
}

export default {
  FIREBASE_APPLICATION_CREDENTIALS: loadJSONOrFileEnv(
    "FIREBASE_APPLICATION_CREDENTIALS"
  ),
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
  GOOGLE_DEFAULT_APPLICATION_CREDENTIALS: loadJSONOrFileEnv(
    "GOOGLE_DEFAULT_APPLICATION_CREDENTIALS"
  ),
  GOOGLE_DOC_MANAGEMENT_USER: process.env.GOOGLE_DOC_MANAGEMENT_USER,
  PORT: process.env.PORT || 3000,
  STATIC_FILE_PATH: path.join(__dirname, "../../dist"),
  UPLOAD_PATH: "/tmp/uploads"
}
