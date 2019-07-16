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
  GOOGLE_DEFAULT_APPLICATION_CREDENTIALS: loadJSONOrFileEnv(
    "GOOGLE_DEFAULT_APPLICATION_CREDENTIALS"
  )
}
