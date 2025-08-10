async function initApp() {
  dotenv.config()
  await connectDatabase()
  const app = express()
  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))
  setupRoutes(app)
  app.use(handleErrors)
  startServer(app)
}

async function connectDatabase() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is not defined')
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
}

function setupRoutes(app) {
  app.use('/api', apiRoutes)
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

function startServer(app) {
  const port = process.env.PORT || 5000
  app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${port}`)
  })
}

initApp().catch(err => {
  console.error(err)
  process.exit(1)
})

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})