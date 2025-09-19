import path from 'node:path'
import util from 'node:util'
import dotenv from 'dotenv'
import winston from 'winston'

const envPath = path.resolve(process.cwd(), '.env')
const envResult = dotenv.config({ path: envPath })
if (envResult.error) {
  if (envResult.error.code === 'ENOENT') {
    console.warn(`No .env file found at ${envPath}`)
  } else {
    console.error(`Error parsing .env file at ${envPath}:`, envResult.error)
    process.exit(1)
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : ''
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`
    }),
  ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
})

function shutdown(code) {
  process.exitCode = code
  setTimeout(() => {
    process.exit(process.exitCode ?? code)
  }, 100)
}

function setupEnvironment() {
  const required = ['NODE_ENV', 'PORT', 'API_KEY']
  const missing = required.filter(key => !process.env[key])
  if (missing.length) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`)
    shutdown(1)
  }
  logger.info(`Environment loaded (${process.env.NODE_ENV})`)
}

function logProcessInfo() {
  const usage = process.memoryUsage()
  logger.info('Process Info', {
    pid: process.pid,
    uptime: `${process.uptime().toFixed(2)}s`,
    memory: {
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
  })
}

function handleProcessEvents() {
  process.on('uncaughtException', err => {
    logger.error('Uncaught Exception', { message: err.message, stack: err.stack })
    shutdown(1)
  })
  process.on('unhandledRejection', reason => {
    if (reason instanceof Error) {
      logger.error('Unhandled Rejection', { message: reason.message, stack: reason.stack })
    } else {
      logger.error('Unhandled Rejection', { reason: util.inspect(reason, { depth: null }) })
    }
    shutdown(1)
  })
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully')
    shutdown(0)
  })
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully')
    shutdown(0)
  })
}

async function initNodeProcess() {
  setupEnvironment()
  handleProcessEvents()
  logProcessInfo()
  setInterval(logProcessInfo, 60 * 1000)
  // Add additional startup logic here (e.g., start server, connect to DB)
}

initNodeProcess().catch(error => {
  logger.error('Failed to initialise node process', { message: error.message, stack: error.stack })
  shutdown(1)
})
