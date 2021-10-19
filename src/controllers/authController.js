
import User from '../models/user.js'
import { Genders, Diets, Drinks } from '../data/enums.js'

import ErrorHandler from '../utils/errorHandler.js'
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js'
import sendToken from '../utils/jwtToken.js'
import sendEmail from '../utils/sendEmail.js'

import crypto from 'crypto'
import cloudinary from 'cloudinary'
import { 
  passwordStrength,
  validEmail, 
  validString, 
  onlyLetters, 
  isDate
} from '../middlewares/validations.js'

import { uploadImage } from '../utils/aws.js'

const { createHash} = crypto
const { v2 } = cloudinary

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  /* 
  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: 'avatars',
    width: 150,
    crop: 'scale'
  })
 */  

  const { username, email, password, confirmPassword } = req.body
  /* 
  const user = await User.create({
    username,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url
    }
  })
  */
  if (!username) {
    return next(new ErrorHandler(req.t("USERNAME_EMPTY"), 400))
  }

  if (username.length < 5 || username.length > 20) {
    return next(new ErrorHandler(req.t('USERNAME_LENGTH'), 400))
  }

  if (validString(username) === true) {
    return next(new ErrorHandler(req.t('USERNAME_INVALID'), 400))
  }

  try {
    const uName = await User.findOne({ username })
    if (uName) {      
      return next(new ErrorHandler(req.t('USER_NAME_IN_USE'), 400))
    }    
  } catch (error) {
    console.log(error)
  }

  if (validEmail(email) !== true) {
    return next(new ErrorHandler(req.t('EMAIL_INVALID'), 400))
  }


  try {
    const uEmail = await User.findOne({ email })
    
    if (uEmail) {
      return next(new ErrorHandler(req.t('EMAIL_IN_USE'), 400))
    }    
  } catch (error) {
    console.log(error)
  }

  if (!password) {
    return next(new ErrorHandler(req.t('PASSWORD_EMPTY'), 400))
  }

  if (password.length < 8) {
    return next(new ErrorHandler(req.t('PASSWORD_LENGTH'), 400))
  }

  if (passwordStrength(password).value < 2) {
    return next(new ErrorHandler(req.t('PASSWORD_WEAK'), 401))
  }

  if (!confirmPassword) {
    return next(new ErrorHandler(req.t('CONFIRM_PASSWORD_EMPTY'), 400))
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler(req.t('PASSWORD_NOT_MATCH'), 400))
  }

  const user = await User.create({
    username,
    email,
    password
  })  

  sendToken(user, 200, res)

})

export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body

  // Checks if email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler(req.t('EMAIL_OR_PASSWORD_EMPTY'), 400))
  }

  // Finding user in database
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorHandler(req.t('EMAIL_OR_PASSWORD_INVALID'), 401))
  }

  // Checks if password is correct or not
  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(new ErrorHandler(req.t('PASSWORD_INVALID'), 401))
  }

  sendToken(user, 200, res)

})

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new ErrorHandler(req.t('USER_NOT_FOUND'), 404))
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  // Create reset password url
  /* const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}` */
  const resetUrl = `${ process.env.FRONTEND_URL }/password/reset/${ resetToken }`

  const message = `${ req.t('PASSWORD_RESET_TOKEN') }\n\n${ resetUrl }\n\n${ req.t('REQUEST_IGNORE')}`

  try {

    await sendEmail({
      email: user.email,
      subject: `${ req.t('PASSWORD_RECOVERY')}`,
      message
    })

    res.status(200).json({
      success: true,
      title: req.t('EMAIL_PASSWORD_RECOVERY'),
      message: `${ req.t('EMAIL_SENT_TO')} ${ user.email }`
    })

  } catch (error) {

    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new ErrorHandler(error.message, 500))

  }
})

export const resetPassword = catchAsyncErrors(async (req, res, next) => {

  // Hash Url Token
  const resetPasswordToken = createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return next(new ErrorHandler(req.t('PASSWORD_RESET_TOKEN_INVALID'), 400))
  }

  if (!password) {
    return next(new ErrorHandler(req.t('PASSWORD_EMPTY'), 400))
  }

  if (password.length < 8) {
    return next(new ErrorHandler(req.t('PASSWORD_LENGTH'), 400))
  }

  if (passwordStrength(password).value < 2) {
    return next(new ErrorHandler(req.t('PASSWORD_WEAK'), 401))
  }

  if (!confirmPassword) {
    return next(new ErrorHandler(req.t('CONFIRM_PASSWORD_EMPTY'), 400))
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler(req.t('PASSWORD_NOT_MATCH'), 400))
  }

  // Setup new password
  user.password = req.body.password

  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user, 200, res)

})

export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    title: req.t('USER_PROFILE'),
    user
  })

})

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword)

  if (!isMatched) {
    return next(new ErrorHandler(req.t('OLD_PASSWORD_INCORRECT')))
  }

  user.password = req.body.password
  await user.save()

  sendToken(user, 200, res)

})

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    role: req.body.role,
    age: req.body.age,
    gender: req.body.gender,
    location: {},
    avatar: {},
    cover: {}
  }

  try {
    const user = await User.findById(req.user.id)

    if (!req.body.username || req.body.username ==='') {
      user.username = req.user.username
    } else if (req.user.username !== req.body.username) {
      return next(new ErrorHandler(req.t('USERNAME_READ_ONLY'), 400))
    } else {
      user.username = req.body.username
    }

    if (!req.body.email || req.body.email === '') {
      user.email = req.user.email
    } else if (req.user.email !== req.body.email) {
      return next(new ErrorHandler(req.t('EMAIL_READ_ONLY'), 400))
    } else {
      user.email = req.body.email
    }

    if (!req.body.role || req.body.role === '') {
      user.role = req.user.role
    } else if (req.user.role !== "admin" && req.user.role !== req.body.role) {
      return next(new ErrorHandler(req.t('ROLE_CHANGE_NOT_ALLOWED'), 400))
    } else {
      user.role = req.body.role
    }

    if (!req.body.firstname || req.body.firstname === '') {
      return next(new ErrorHandler(req.t('FIRSTNAME_EMPTY'), 400))
    }

    if (req.body.firstname.length < 2 || req.body.firstname.length > 20) {
      return next(new ErrorHandler(req.t('FIRSTNAME_LENGTH'), 400))
    }

    if (!onlyLetters(req.body.firstname)) {
      return next(new ErrorHandler(req.t('FIRSTNAME_STRING'), 400))
    }

    if (!req.body.lastname || req.body.firstname === '') {
      return next(new ErrorHandler(req.t('LASTNAME_EMPTY'), 400))
    }

    if (req.body.lastname.length < 2 || req.body.lastname.length > 20) {
      return next(new ErrorHandler(req.t('LASTNAME_LENGTH'), 400))
    }

    if (!onlyLetters(req.body.lastname)) {
      return next(new ErrorHandler(req.t('LASTNAME_STRING'), 400))
    }

    if (!isDate(req.body.age)) {
      return next(new ErrorHandler(req.t('INVALID_DATE'), 400))
    }

    if (Object.values(Genders).indexOf(req.body.gender) === -1) {
      return next(new ErrorHandler(req.t('GENDER_UNKNOWN'), 400))
    }
    
  } catch (error) {
    console.log(error)
  }

  newUserData.location = {
    country: req.body.location.country, 
    city: req.body.location.city,
    state: req.body.location.state
  }

  // Update avatar
  if (req.body.avatar !== '') {
/*
    const user = await User.findById(req.user.id)

    const image_id = user.avatar.public_id
    const res = await v2.uploader.destroy(image_id)

    const result = await v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale'
    })
    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url
    }
 */
    newUserData.avatar = {
      public_id: req.body.avatar.public_id
    }

    // Update cover
    if (req.body.cover !== '') {
      newUserData.cover = {
        public_id: req.body.cover.public_id
      }
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    title: req.t('UPDATE_PROFILE'),
    user
  })

})

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    title: req.t('LOGGED_OUT'),
    message: req.t('LOGGED_OUT')
  })
})

export const allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    success: true,
    title: req.t('ALL_USERS'),
    users
  })
})

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorHandler(`${ req.t('USER_NOT_FOUND_ID')} ${ req.params.id }`))
  }

  res.status(200).json({
    success: true,
    title: req.t('USER_DETAILS'),
    user
  })
})

export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    username: req.body.username,
    email: req.body.email,
    role: req.body.role
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    title: req.t('UPDATE_USER'),
    user
  })

})

export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorHandler(`${req.t('USER_NOT_FOUND_ID')} ${ req.params.id }`))
  }

  // Remove avatar from cloudinary - TODO

  await user.remove()

  res.status(200).json({
    success: true,
    title: req.t('DELETE_USER')
  })
})

// Hobbies
export const addHobbies = catchAsyncErrors(async (req, res, next) => {

  const {
    name
  } = req.body

  const hobby = {
    user: req.user._id,
    name
  }

  try {
    const hUser = await User.findById(req.user._id)

    if (!name || name === '') {
      return next(new ErrorHandler(req.t('HOBBY_EMPTY'), 400))
    }

    if (name.length < 3 || name.length > 20) {
      return next(new ErrorHandler(req.t('HOBBY_LENGTH'), 400))
    }

    if (validString(name) === true) {
      return next(new ErrorHandler(req.t('HOBBY_STRING'), 400))
    }

    // check if hobby already exists  
    if (hUser.hobbies.some(h => h.name === name)) {
      return next(new ErrorHandler(req.t('HOBBY_EXISTS'), 400))
    } else {
      hUser.hobbies.push(hobby)
    }

    await hUser.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: req.t('HOBBY_CREATED')
    })
  } catch (error) {
    console.log(error)
  }
})
// Get user hobbies : /hobbies?id={user._id}
export const getUserHobbies = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.query.id)

  res.status(200).json({
    success: true,
    hobbies: user.hobbies
  })
})

export const deleteHobby = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.query.user)

  const hobbies = user.hobbies.filter(hobby => hobby._id.toString() !== req.query.id.toString())

  await User.findByIdAndUpdate(req.query.user, {
    hobbies
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    message: req.t('HOBBY_DELETED')
  })
})

// Favorites
export const addFavorites = catchAsyncErrors(async (req, res, next) => {

  const {
    diet,
    drink
  } = req.body

  const favorite = {
    user: req.user._id,
    diet,
    drink
  }

  try {
    const fUser = await User.findById(req.user._id)

    if ((!diet || diet === '') && (!drink || drink === '')) {
      return next(new ErrorHandler(req.t('FAVORITE_EMPTY'), 400))
    }

    // Check if diet is valid
    if (Object.values(Diets).indexOf(diet) === -1) {
      return next(new ErrorHandler(req.t('DIET_UNKNOWN'), 400))
    }

    // Check if drink is valid
    if (Object.values(Drinks).indexOf(drink) === -1) {
      return next(new ErrorHandler(req.t('DRINK_UNKNOWN'), 400))
    }

    // check if favorite already exists (the combination of diet and drink)
    if (fUser.favorites.some(f => f.diet === diet) && fUser.favorites.some(f => f.drink === drink)) {
      return next(new ErrorHandler(req.t('FAVORITE_EXISTS'), 400))
    }

    fUser.favorites.push(favorite)

    await fUser.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: req.t('FAVORITE_CREATED')
    })
  } catch (error) {
    console.log(error)
  }
})
// Get user favorites : /favorites?id={user._id}
export const getUserFavorites = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.query.id)

  res.status(200).json({
    success: true,
    favorites: user.favorites
  })
})

export const deleteFavorite = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.query.user)

  const favorites = user.favorites.filter(favorite => favorite._id.toString() !== req.query.id.toString())

  await User.findByIdAndUpdate(req.query.user, {
    favorites
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    message: req.t('FAVORITE_DELETED')
  })
})

// Images
export const uploadImages = catchAsyncErrors(async (req, res, next) => {
  try {
    const { upload, allowComments } = req.body
    const newImage = {
      user: req.user._id,
      image: `https://rambagiza-online.s3.us-east-2.amazonaws.com/${ upload }`,
      date: new Date(),
      likes: [],
      allowComments,
      comments:[]
    }

    const iUser = await User.findById(req.user._id)

    if (!upload || upload ==='') {
    return next(new ErrorHandler(req.t('IMAGE_EMPTY'), 400))
    }

    iUser.images.push(newImage)

    await iUser.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: req.t('IMAGE_UPLOADED')
    })
  } catch (error) {
    console.log(error)
  }
})

export const getUserImages = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.query.id)

  res.status(200).json({
    success: true,
    images: user.images
  })
})

export const deleteImage = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.query.user)

  const images = user.images.filter(image => image._id.toString() !== req.query.id.toString())

  await User.findByIdAndUpdate(req.query.user, {
    images
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    message: req.t('IMAGE_DELETED')
  })
})

// Likes
export const addLikes = catchAsyncErrors(async (req, res, next) => {
  try {
    const like = {
      likeUser: req.user._id,
      date: new Date()
    }

    const lUser = await User.findById({_id: req.params.id})

    // check if like user already exists
    if (lUser.likes.some(l => l.likeUser === req.user._id)) {
      lUser.likes.filter(like => like._id.toString() !== req.query.id.toString())
    } else {
      lUser.likes.push(like)
    }
    
    await lUser.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: req.t('LIKE_CREATED')
    })
  } catch (error) {
    console.log(error)
  }
})
// Get user likes : /likes?id={user._id}
export const getUserLikes = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.query.id)

    res.status(200).json({
      success: true,
      userLikes: user.likes,
      numLikes: user.likes.length
    })    
  } catch (error) {
    console.log(error)
  }
})
