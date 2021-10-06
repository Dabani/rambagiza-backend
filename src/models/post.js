import mongoose from 'mongoose';

const { Schema, model } = mongoose

const postSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please enter post title!'],
    trim: true,
    maxLength: [200, 'post title cannot exceed 200 characters.']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [false, 'Please enter post description!']
  },
  ratings: {
    type: Number,
    default: 0
  },
  likes: [ {
    likeUser: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  } ],
  images: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],
  category: {
    type: String,
    required: [true, 'Please select category for this post'],
    enum: {
      values: [
        'Romance',
        'History',
        'Poetry',
        'Science',
        'Technology',
        'Religion',
        'Politics',
        'Showbizz',
        'Beauty/Health',
        'Sports',
        'Music',
        'Sociology'
      ],
      message: 'Please select correct category for this post!'
    }
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  }
},{timestamps: true});

export default model('Post', postSchema);