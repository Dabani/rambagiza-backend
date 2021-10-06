import express from 'express'

// Import all routes
import posts from './routes/post.js'
import auth from './routes/auth.js'

// Translation Settings
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import { LanguageDetector, handle } from 'i18next-http-middleware'

i18next.use(Backend).use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: './locales/{{lng}}/translation.json'
    }
  })

const app = express()

app.use(handle(i18next))

import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

import errorMiddleware from './middlewares/errors.js'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(fileUpload({ useTempFiles: true }))

app.use('/api/v1', posts)
app.use('/api/v1', auth)

// Middleware to handle errors
app.use(errorMiddleware)

export default app
