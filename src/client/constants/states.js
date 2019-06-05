export const STATES = {
  mn: "Minnesota",
  ma: "Massachusetts"
}

export const STATES_AS_OPTIONS = Object.keys(STATES).map(key => {
  return { value: key, label: STATES[key] }
})
