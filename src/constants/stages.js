export const STAGES = {
  exploration: 'Exploration',
  planning: 'Planning',
  startup: 'Startup'
}

export const STAGES_AS_OPTIONS = Object.keys(STATES).map((key) => { return {'value': key, 'label': STATES[key]} } )