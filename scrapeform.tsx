const validateUrl = (url: string): boolean => {
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const startScraping = async (url: string, signal: AbortSignal): Promise<ScrapeResult> => {
  try {
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal,
    })
    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch {}
      const message = (errorData as any).message || 'Scraping failed'
      throw new Error(message)
    }
    return await response.json()
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Scraping was cancelled.')
    }
    throw new Error(err.message || 'Network error occurred.')
  }
}

export default function ScrapeForm({ onScrapeComplete }: ScrapeFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isMounted = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      isMounted.current = false
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
      const result = await startScraping(trimmedUrl, controller.signal)
      if (isMounted.current) {
        onScrapeComplete?.(result)
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'An unexpected error occurred.')
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="scrape-form">
      <div className="form-group">
        <label htmlFor="url">Product Page URL</label>
        <input
          type="text"
          id="url"
          name="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/product"
          disabled={loading}
          className="form-input"
        />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" disabled={loading} className="form-button">
        {loading ? 'Scraping...' : 'Scrape'}
      </button>
    </form>
  )
}