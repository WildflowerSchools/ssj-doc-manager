export const STATES = {
  mn: 'Minnesota',
  ma: 'Massachusetts'
}

for (const key in STATES) {
  let val = STATES[key];
  {key: val}
}
export const STATES_AS_OPTIONS = STATES.map((val, key) => 'val': key)