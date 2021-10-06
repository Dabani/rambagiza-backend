import ErrorHandler from '../utils/errorHandler.js'

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack
    })
  }

  if (process.env.NODE_ENV === 'PRODUCTION') {
    let error = {...err}

    error.message = err.message

    // Wrong Mongoose Object ID Error
    if (err.name === 'CastError') {
      const message = 'RESOURCE_NOT_FOUND' + err.path
      error = new ErrorHandler(message, 400)
    }

    // Handling Mongoose Validation Error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(value => value.message)
      error = new ErrorHandler(message, 400)
    }

    // Handling Mongoose Duplicate Key errors
    if (err.code === 11000) {
      const message = `DUPLICATE_KEY ${Object.keys(err.keyValue)}`
      error = new ErrorHandler(message, 400)
    }

    // Handling Wrong JWT error
    if (err.name === 'JsonWebTokenError') {
      const message = 'JWT_EXPIRED'
      error = new ErrorHandler(message, 400)
    }

    // Handling Expired JWT error
    if (err.name === 'TokenExpiredError') {
      const message = 'JWT_INVALID'
      error = new ErrorHandler(message, 400)
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || 'INTERNAL_SERVER_ERROR'
    })
  }
}