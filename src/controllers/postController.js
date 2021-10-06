import Post from '../models/post.js'

import ErrorHandler from '../utils/errorHandler.js'
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js'
import APIFeatures from '../utils/apiFeatures.js'

export const newPost = catchAsyncErrors(async (req, res, next) => {

  req.body.user = req.user.id

  const post = await Post.create(req.body)

  res.status(201).json({
    success: true,
    post
  })
})

export const getPosts = catchAsyncErrors(async (req, res, next) => {

  const resPerPage = 8
  const postsCount = await Post.countDocuments() /* Total number of posts to use in the frontend app */

  const apiFeatures = new APIFeatures(Post.find(), req.query)
    .search()
    .filter()
    

  let posts = await apiFeatures.query
  let filteredPostsCount = posts.length

  apiFeatures.pagination(resPerPage)
  posts = await apiFeatures.query

  res.status(200).json({
    success: true,
    postsCount,
    resPerPage,
    filteredPostsCount,
    posts
  })
})

export const getSinglePost = catchAsyncErrors(async (req, res, next) => {

  const post = await Post.findById(req.params.id)

  if (!post) {
    return next(new ErrorHandler('Post not found', 404))
  }

  res.status(200).json({
    success: true,
    post
  })
})

export const updatePost = catchAsyncErrors(async (req, res, next) => {

  let post = await Post.findById(req.params.id)

  if (!post) {
    return next(new ErrorHandler('Post not found', 404))
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    post
  })
})

export const deletePost = catchAsyncErrors(async (req, res, next) => {

  const post = await Post.findById(req.params.id)

  if (!post) {
    return next(new ErrorHandler('Post not found', 404))
  }

  await post.remove()

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully.'
  })
})

export const createPostReview = catchAsyncErrors(async(req, res, next) => {

  const {
    rating,
    comment,
    postId
  } = req.body

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  }

  const post = await Post.findById(postId)

  const isReviewed = post.reviews.find(
    r => r.user.toString() === req.user._id.toString() /* r for review */
  )
  
  if (isReviewed) {
    post.reviews.forEach(review => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment
        review.rating = rating
      }
    })
  } else {
    post.reviews.push(review)
    post.numOfReviews = post.reviews.length
  }

  // Calculate overall rating
  post.ratings = post.reviews.reduce((acc, item) => item.rating + acc, 0) / post.reviews.length

  await post.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true
  })
})

export const getPostReviews = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.query.id)

  res.status(200).json({
    success: true,
    reviews: post.reviews
  })
})

export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.query.postId)

  const reviews = post.reviews.filter(review => review._id.toString() !== req.query.id.toString())

  const numOfReviews = reviews.length

  const ratings = post.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

  await Post.findByIdAndUpdate(req.query.postId, {
    reviews,
    ratings,
    numOfReviews
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true
  })
})