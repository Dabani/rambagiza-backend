import mongoose from 'mongoose'
import validator from 'validator'
import bcryptjs from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import crypto from 'crypto' /* Builtin library, nothing to install */

import {
  Genders,
  Ethnies,
  Religions,
  Orientations,
  Relationships,
  Diets,
  Drinks,
} from '../data/enums.js'

const { Schema, model } = mongoose
const { isEmail } = validator
const { hash, compare } = bcryptjs
const { sign } = jsonwebtoken
const { randomBytes, createHash } = crypto



const userSchema = new Schema({
  username: {
    type: String,
    required: [ true, 'Please enter your username' ],
    maxlength: [ 20, 'Your username cannot exceed 20 characters' ],
    minlength: [ 5, 'Username cannot be less than 5 characters' ]
  },
  firstname: {
    type: String,
    maxlength: [ 20, 'Your firstname cannot exceed 20 characters' ],
    minlength: [ 2, 'Your firstname must be longer than 2 characters' ]
  },
  lastname: {
    type: String,
    maxlength: [ 20, 'Your lastname cannot exceed 20 characters' ],
    minlength: [ 2, 'Your lastname must be longer than 2 characters' ]
  },
  email: {
    type: String,
    required: [ true, 'Please enter your email' ],
    unique: true,
    validate: [ isEmail, 'Please enter valid email address' ]
  },
  password: {
    type: String,
    required: [ true, 'Please enter your password' ],
    minlength: [ 8, 'Your password must be longer than 8 characters' ],
    select: false
  },
  avatar: {
    public_id: {
      type: String,
      required: false
    },
    url: {
      type: String,
      default: '/images/default_avatar.jpg'
    }
  },
  cover: {
    public_id: {
      type: String,
      required: false
    },
    url: {
      type: String,
      default: '/images/cover.jpg'
    }
  },
  role: {
    type: String,
    default: 'user'
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  },
  location: {
    country: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    }
  },
  age: {
    type: Date
  },
  gender: {
    type: String,
    enum: Object.values(Genders)
  },
  ethnicity: {
    type: String,
    enum: Object.values(Ethnies)
  },
  religion: {
    type: String,
    enum: Object.values(Religions)
  },
  'orientation': {
    type: String,
    enum: Object.values(Orientations)
  },
  relationship: {
    type: String,
    enum: Object.values(Relationships)
  },
  hobbies: [
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String
      }
    }
  ],
  favorites: [
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
      },
      diet: {
        type: String,
        enum: Object.values(Diets)
      },
      drink: {
        type: String,
        enum: Object.values(Drinks)
      }
    }
  ],
  images: [
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
      },
      image: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      likes: [
        {
          imageId: {
            type: String
          },
          likeUser: {
            type: Schema.ObjectId,
            ref: 'User'
          },
          date: {
            type: Date,
            default: Date.now
          }
        }
      ],
      allowComments: {
        type: Boolean,
        default: false
      },
      comments: [
        {
          imageId: {
            type: String
          },
          commentUser: {
            type: Schema.ObjectId,
            ref: 'User'
          },
          comment: {
            type: String
          },
          date: {
            type: Date,
            default: Date.now
          }
        }
      ]
    }
  ],
  likes: [
    {
      likeUser: {
        type: Schema.ObjectId,
        ref: 'User'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  friends: [
    {
      friend: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
      },
      isFriend: {
        type: Boolean,
        default: false
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  online: {
    type: Boolean,
    default: false
  },
  wallet: {
    type: Number,
    default: 3
  }
}, { timestamps: true })

// Encrypting password before saving user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  this.password = await hash(this.password, 10)
})

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password)
}

// Return JWT token
userSchema.methods.getJwtToken = function () {
  return sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  })
}

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = randomBytes(20).toString('hex')

  // Hash and set to resetPasswordToken
  this.resetPasswordToken = createHash('sha256').update(resetToken).digest('hex')

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

  return resetToken

}

// Enumerations
Object.assign(userSchema.statics, {
  Genders,
  Ethnies,
  Religions,
  Orientations,
  Relationships,
  Diets,
  Drinks,
});

export default model('User', userSchema)
