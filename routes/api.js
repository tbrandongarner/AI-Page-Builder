import { Router } from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from 'openai'

const router = Router()

const openAiApiKey = process.env.OPENAI_API_KEY
const openAiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const openAiClient = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null

router.post('/scrape', async (req, res, next) => {
  try {
    const { url } = req.body ?? {}

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'A valid "url" is required.' })
    }

    const parsedUrl = validateUrl(url)
    if (!parsedUrl) {
      return res.status(400).json({ message: 'Please provide a valid http(s) URL.' })
    }

    const { data: html } = await axios.get(parsedUrl, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36'
      }
    })

    const product = extractProductDetails(html, parsedUrl)
    return res.json(product)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502
      const message =
        error.response?.data?.message ||
        error.response?.statusText ||
        'Failed to retrieve the provided product page.'
      return res.status(status >= 400 && status < 600 ? status : 502).json({ message })
    }
    return next(error)
  }
})

router.post('/generate-copy', async (req, res, next) => {
  try {
    const { prompt } = req.body ?? {}
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'A non-empty "prompt" is required.' })
    }

    const sanitizedPrompt = prompt.trim()
    const result = await generateCopyFromPrompt(sanitizedPrompt)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
})

function validateUrl(candidate) {
  try {
    const parsed = new URL(candidate)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
    return null
  } catch {
    return null
  }
}

function extractProductDetails(html, pageUrl) {
  const $ = cheerio.load(html)
  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    $('title').text().trim() ||
    'Untitled Product'

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    $('[itemprop="description"]').first().text().trim() ||
    'No description found for this product yet.'

  const priceText =
    $('[itemprop="price"]').attr('content') ||
    $('[data-price]').first().attr('data-price') ||
    $('[class*="price"]').first().text() ||
    $('[id*="price"]').first().text() ||
    ''
  const price = parsePrice(priceText)

  const images = collectImageUrls($, pageUrl)

  return {
    title,
    description,
    price,
    images,
    url: pageUrl
  }
}

function collectImageUrls($, pageUrl) {
  const imageCandidates = new Set()
  const addCandidate = src => {
    if (!src) return
    try {
      const resolved = new URL(src, pageUrl).toString()
      imageCandidates.add(resolved)
    } catch {
      // Ignore invalid URLs
    }
  }

  addCandidate($('meta[property="og:image"]').attr('content'))
  addCandidate($('meta[name="twitter:image"]').attr('content'))

  $('img').each((_, element) => {
    addCandidate($(element).attr('src'))
    addCandidate($(element).attr('data-src'))
    addCandidate($(element).attr('data-lazy-src'))
  })

  return Array.from(imageCandidates).slice(0, 10)
}

function parsePrice(value) {
  if (!value || typeof value !== 'string') return 0
  const normalized = value.replace(/[,\s]/g, '')
  const match = normalized.match(/(-?\d+(?:\.\d+)?)/)
  if (!match) return 0
  return Number.parseFloat(match[1])
}

async function generateCopyFromPrompt(prompt) {
  let copy = ''
  let source = 'fallback'

  if (openAiClient) {
    try {
      const completion = await openAiClient.chat.completions.create({
        model: openAiModel,
        temperature: 0.7,
        max_tokens: 320,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert marketing copywriter. Produce engaging, conversion-focused copy using markdown where appropriate.'
          },
          {
            role: 'user',
            content: `Create compelling marketing copy for the following product details:\n\n${prompt}`
          }
        ]
      })

      copy = completion?.choices?.[0]?.message?.content?.trim() || ''
      if (copy) {
        source = 'openai'
      }
    } catch (error) {
      console.error('OpenAI request failed, using fallback copy instead.', error)
    }
  }

  if (!copy) {
    copy = buildFallbackCopy(prompt)
  }

  return {
    copy,
    prompt,
    source,
    generatedAt: new Date().toISOString()
  }
}

function buildFallbackCopy(prompt) {
  const sanitizedPrompt = prompt.replace(/\s+/g, ' ').trim()
  return [
    `✨ **Introducing ${sanitizedPrompt || 'your product'}**`,
    '',
    'Experience the perfect blend of innovation and quality. Designed to delight, this offering delivers real value from the very first use.',
    '',
    '✅ **Why customers love it**',
    '- Thoughtfully crafted to solve real problems',
    '- Reliable, durable, and built to impress',
    '- Supported by a friendly team that cares',
    '',
    '🚀 Ready to level up your product experience? Act now and feel the difference.'
  ].join('\n')
}

export default router
