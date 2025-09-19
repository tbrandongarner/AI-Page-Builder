import React, { useEffect, useRef, useState } from 'react'
import type { ProductInput } from './types'

interface ScrapeFormProps {
  onScrapeComplete: (data: ProductInput) => void
}

const validateUrl = (url: string): boolean => {
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

async function requestScrape(url: string, signal: AbortSignal): Promise<ProductInput> {
  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal,
  })

  if (!response.ok) {
    let message = 'Scraping failed.'
    try {
      const data = await response.json()
      if (typeof data?.message === 'string') {
        message = data.message
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(message)
  }

  const payload = (await response.json()) as ProductInput
  return payload
}

const ScrapeForm: React.FC<ScrapeFormProps> = ({ onScrapeComplete }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedUrl = url.trim()
    setError(null)

    if (!validateUrl(trimmedUrl)) {
      setError('Please enter a valid URL (http or https).')
      return
    }

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    try {
      const result = await requestScrape(trimmedUrl, controller.signal)
      if (isMountedRef.current) {
        onScrapeComplete(result)
      }
    } catch (err) {
      if (!isMountedRef.current) return
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(message)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="scrape-form">
      <div className="form-group">
        <label htmlFor="url" className="form-label">
          Product page URL *
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/product-page"
          disabled={loading}
          className="form-input"
          required
        />
        <div className="form-hint">Enter a product page URL to automatically extract product information.</div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" disabled={loading || !url.trim()} className="form-button">
        {loading ? (
          <>
            <span className="loading-spinner" aria-hidden="true" /> Scraping…
          </>
        ) : (
          'Scrape Product Data'
        )}
      </button>
    </form>
  )
}

export default ScrapeForm
