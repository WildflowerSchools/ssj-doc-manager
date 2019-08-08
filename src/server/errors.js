class SSJError extends Error {
  constructor(title = "Error", httpCode = 500, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    this.name = "SSJError"

    // Custom debugging information
    this.title = title
    this.httpCode = httpCode
    this.date = new Date()
  }
}

class SSJWarning extends Error {
  constructor(title = "Warning", ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    this.name = "SSJWarning"

    // Custom debugging information
    this.title = title
    this.date = new Date()
  }
}

module.exports = { SSJError, SSJWarning }
