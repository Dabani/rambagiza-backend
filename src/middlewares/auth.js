import User from '../models/user.js'

import jsonwebtoken from "jsonwebtoken"
import ErrorHandler from "../utils/errorHandler.js"
import catchAsyncErrors from "./catchAsyncErrors.js"

const { verify } = jsonwebtoken

export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

  const { token } = req.cookies

  if (!token) {
    return next(new ErrorHandler(req.t('LOGIN_TO_ACCESS'), 401))
  }

  const decoded = verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id)

  next()
})

// Handling users roles
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.t('ROLE')} (${ req.user.role}) ${req.t('ROLE_NOT_ALLOWED')}`, 403)
        )
    }

    next()

  }
}