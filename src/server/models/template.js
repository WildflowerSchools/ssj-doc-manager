import { firebase } from "../util/Firebase"

const getTemplate = async templateId => {
  try {
    const templateRef = firebase.template_document(templateId)
    const templateSnapshot = await templateRef.get()
    return {
      data: () => {
        return {
          ...templateSnapshot.data(),
          ...{ id: templateSnapshot.id }
        }
      },
      ref: () => {
        return templateRef
      }
    }
  } catch (err) {
    console.error(`Unable to find template ${templateId}`)
    return null
  }
}

const getEmptyModel = (all_states = true, states = [], stage = "") => {
  return {
    all_states: all_states,
    states: states,
    stage: stage,
    documents: []
  }
}

export default { getTemplate, getEmptyModel }
