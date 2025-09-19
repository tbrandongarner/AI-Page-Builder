import { Queue, QueueScheduler, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import axios from 'axios'
import { parse } from 'node-html-parser'
import { Configuration, OpenAIApi } from 'openai'
import { v4 as uuidv4 } from 'uuid'

const REDIS_URL = process.env.REDIS_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS

if (!REDIS_URL) {
  throw new Error('Missing required environment variable: REDIS_URL')
}
if (!OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY')
}
if (!ALLOWED_DOMAINS) {
  throw new Error('Missing required environment variable: ALLOWED_DOMAINS')
}

const allowedDomains = ALLOWED_DOMAINS.split(',').map(d => d.trim().toLowerCase())

const QUEUE_NAME = 'job-queue'
const connection = new IORedis(REDIS_URL)
const queue = new Queue(QUEUE_NAME, { connection })
const scheduler = new QueueScheduler(QUEUE_NAME, { connection })

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }))

type ScrapeJobData = { url: string; payloadId: string }
type AIJobData = { metadata: Record<string, any>; payloadId: string }

type AIResultHandler = (params: {
  payloadId: string
  metadata: Record<string, any>
  result: string
}) => Promise<void> | void

type ProcessQueueOptions = {
  aiResultHandler?: AIResultHandler
}

let worker: Worker | null = null
let aiResultHandler: AIResultHandler | undefined

export async function processQueue(options?: ProcessQueueOptions): Promise<void> {
  aiResultHandler = options?.aiResultHandler
  worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      if (job.name === 'scrape') {
        await processScrapeJob(job.data as ScrapeJobData)
      } else if (job.name === 'ai') {
        await processAIJob(job.data as AIJobData)
      } else {
        throw new Error(`Unknown job type: ${job.name}`)
      }
    },
    {
      connection,
      concurrency: 5,
      lockDuration: 600000,
      settings: { backoffStrategies: {} },
    }
  )

  worker.on('completed', ({ id, name }) => {
    console.log(`Job ${name} [${id}] completed`)
  })

  worker.on('failed', ({ id, name, failedReason }) => {
    console.error(`Job ${name} [${id}] failed: ${failedReason}`)
  })

  worker.on('error', err => {
    console.error('Worker error', err)
  })
}

async function processScrapeJob(data: ScrapeJobData): Promise<void> {
  const { url, payloadId } = data
  let hostname: string
  try {
    const parsedUrl = new URL(url)
    hostname = parsedUrl.hostname.toLowerCase()
  } catch {
    throw new Error(`Invalid URL: ${url}`)
  }
  if (!allowedDomains.includes(hostname)) {
    throw new Error(`Domain not allowed: ${hostname}`)
  }

  try {
    const response = await axios.get(url, { timeout: 15000 })
    const root = parse(response.data)
    const metadata: Record<string, any> = {
      title: root.querySelector('title')?.text || '',
      description:
        root.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      images: Array.from(root.querySelectorAll('img')).map(img =>
        img.getAttribute('src')
      ),
      url,
    }
    await scheduleJob({
      name: 'ai',
      data: { metadata, payloadId },
    })
  } catch (err) {
    console.error(`Scrape job ${payloadId} failed`, err)
    throw err
  }
}

async function processAIJob(data: AIJobData): Promise<void> {
  const { metadata, payloadId } = data
  try {
    const prompt = `
Generate an SEO-optimized product page title and description based on the following metadata:
${JSON.stringify(metadata)}
`
    const completion = await openai.createCompletion({
      model: 'gpt-4',
      prompt,
      max_tokens: 500,
      temperature: 0.7,
    })
    const result = completion.data.choices[0].text?.trim() || ''
    if (aiResultHandler) {
      await aiResultHandler({ payloadId, metadata, result })
    } else {
      console.log(`AI job ${payloadId} result:`, result)
      console.warn('AI result handler not configured; result not persisted.')
    }
  } catch (err) {
    console.error(`AI job ${payloadId} failed`, err)
    throw err
  }
}

export async function scheduleJob(opts: {
  name: 'scrape' | 'ai'
  data: ScrapeJobData | AIJobData
}): Promise<void> {
  const payloadId = (opts.data as any).payloadId || uuidv4()
  const jobData = { ...opts.data, payloadId }
  await queue.add(opts.name, jobData, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  })
}

export async function retryJob(payloadId: string): Promise<void> {
  const jobs = await queue.getJobs(['waiting', 'failed', 'delayed'])
  const job = jobs.find(j => (j.data as any).payloadId === payloadId)
  if (job) {
    const { name, data, opts } = job
    await queue.add(name, data, {
      attempts: opts.attempts || 3,
      backoff: opts.backoff || { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    })
  } else {
    throw new Error(`Job not found for payloadId: ${payloadId}`)
  }
}

async function shutdown() {
  try {
    if (worker) {
      await worker.close()
    }
    await scheduler.close()
    await queue.close()
    await connection.quit()
    process.exit(0)
  } catch (err) {
    console.error('Error during shutdown', err)
    process.exit(1)
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)