import app from './src/app.js'
import connectDatabase from './src/config/database.js'

import dotenv from 'dotenv'
import cloudinary from 'cloudinary'

const { config } = dotenv
const { config: _config } = cloudinary

// Handle Uncaught exception
process.on('uncaughtException', err => {
  console.log(`ERROR: ${ err.message }`)
  console.log(`Shutting down due to uncaught exceptions.`)
  process.exit(1)
})

// Setting up config file
config({ path: 'src/config/config.env' })

// Connecting to database
connectDatabase()

// Setting up cloudinary
_config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on PORT: ${ process.env.PORT } in ${ process.env.NODE_ENV } mode.`)
})

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', err => {
  console.log(`ERROR: ${ err.message }`)
  console.log(`Shutting down due to Unhandled Promise rejection`)
  server.close(() => {
    process.exit(1)
  })
})