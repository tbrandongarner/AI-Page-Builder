import { Queue, QueueScheduler, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import axios from 'axios'
import { parse } from 'node-html-parser'
import OpenAI from 'openai'
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

const allowedDomains = ALLOWED_DOMAINS.split(',').map(domain => domain.trim().toLowerCase())

const QUEUE_NAME = 'job-queue'

type JobName = 'scrape' | 'ai'

interface BaseJobData {
  payloadId?: string
}

interface ScrapeJobData extends BaseJobData {
  url: string
}

interface ScrapeMetadata {
  title: string
  description: string
  images: string[]
  url: string
}

interface AIJobData extends BaseJobData {
  metadata: ScrapeMetadata
}

type JobPayload = ScrapeJobData | AIJobData

const connection = new IORedis(REDIS_URL)
const queue = new Queue<JobPayload, void, JobName>(QUEUE_NAME, { connection })
const scheduler = new QueueScheduler<JobPayload, JobName>(QUEUE_NAME, { connection })

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

type AIResultHandler = (params: {
  payloadId: string
  metadata: ScrapeMetadata
  result: string
}) => Promise<void> | void

type ProcessQueueOptions = {
  aiResultHandler?: AIResultHandler
}

let worker: Worker | null = null
let aiResultHandler: AIResultHandler | undefined
let schedulerReady: Promise<void> | null = null

export async function processQueue(options?: ProcessQueueOptions): Promise<void> {
  aiResultHandler = options?.aiResultHandler
  if (!schedulerReady) {
    schedulerReady = scheduler.waitUntilReady()
  }
  await schedulerReady

  if (worker) {
    return
  }
  worker = new Worker<JobPayload, void, JobName>(
    QUEUE_NAME,
    async (job: Job<JobPayload, unknown, JobName>) => {
      const jobWithId = job.data as JobPayload & { payloadId: string }
      if (job.name === 'scrape') {
        await processScrapeJob(jobWithId)
      } else if (job.name === 'ai') {
        await processAIJob(jobWithId)
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

async function processScrapeJob(data: ScrapeJobData & { payloadId: string }): Promise<void> {
  const { url, payloadId } = data
  let hostname: string
  try {
    const parsedUrl = new URL(url)
    hostname = parsedUrl.hostname.toLowerCase()
  } catch {
    throw new Error(`Invalid URL: ${url}`)
  }
  const isAllowedDomain = allowedDomains.some(domain =>
    hostname === domain || hostname.endsWith(`.${domain}`),
  )
  if (!isAllowedDomain) {
    throw new Error(`Domain not allowed: ${hostname}`)
  }

  try {
    const response = await axios.get(url, { timeout: 15000 })
    const root = parse(response.data)
    const imageCandidates = Array.from(root.querySelectorAll('img'))
      .map(img => img.getAttribute('src') || img.getAttribute('data-src'))
      .filter((src): src is string => Boolean(src))
      .map(src => {
        try {
          return new URL(src, url).toString()
        } catch {
          return null
        }
      })
      .filter((src): src is string => Boolean(src))
    const uniqueImages = Array.from(new Set(imageCandidates))
    const metadata: ScrapeMetadata = {
      title: root.querySelector('title')?.text?.trim() || '',
      description:
        root.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '',
      images: uniqueImages,
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

async function processAIJob(data: AIJobData & { payloadId: string }): Promise<void> {
  const { metadata, payloadId } = data
  try {
    const prompt = [
      'Generate an SEO-optimized product page title and description.',
      'Respond with concise paragraphs and bullet points where it improves readability.',
      `Metadata: ${JSON.stringify(metadata)}`,
    ].join('\n')

    const completion = await openai.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_output_tokens: 500,
      input: prompt,
    })
    const result = completion.output_text?.trim() ?? ''
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

type ScheduleOptions =
  | { name: 'scrape'; data: ScrapeJobData }
  | { name: 'ai'; data: AIJobData }

export async function scheduleJob(opts: ScheduleOptions): Promise<void> {
  const payloadId = opts.data.payloadId ?? uuidv4()
  const jobData = { ...opts.data, payloadId } as JobPayload
  await queue.add(opts.name, jobData, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  })
}

export async function retryJob(payloadId: string): Promise<void> {
  const jobs = await queue.getJobs(['waiting', 'failed', 'delayed'])
  const job = jobs.find(j => {
    const data = j.data as JobPayload
    return data.payloadId === payloadId
  })
  if (job) {
    const { name, data, opts } = job
    await queue.add(name as JobName, data as JobPayload, {
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
      worker = null
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
