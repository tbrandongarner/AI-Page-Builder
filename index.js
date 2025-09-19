import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'

import apiRoutes from './routes/api.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/api', apiRoutes)
app.use(handleErrors)

let server

async function connectDatabase() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is not defined')

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
}

function handleErrors(err, req, res, next) {
  const status = err.statusCode || 500
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
}

function startServer() {
  const port = process.env.PORT || 5000
  server = app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${port}`)
  })
  return server
}

function stopServer() {
  if (server) {
    server.close()
    server = null
  }
}

async function initApp() {
  await connectDatabase()
  if (process.env.NODE_ENV !== 'test') {
    startServer()
  }
  return app
}

if (process.env.NODE_ENV !== 'test') {
  initApp().catch(err => {
    console.error(err)
    process.exit(1)
  })
}

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

export { app, initApp, connectDatabase, startServer, stopServer }
export default app
