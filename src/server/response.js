const sendSuccess = (res, jsonData = {}) => {
  res.json(jsonData)
}

const sendError = (res, httpCode, errTitle = "", errDetail = "") => {
  res.status(httpCode)
  res.json({
    title: errTitle,
    detail: errDetail,
    status: httpCode
  })
}

export { sendSuccess, sendError }
