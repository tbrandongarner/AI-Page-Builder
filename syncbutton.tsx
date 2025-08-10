const DEFAULT_TIMEOUT = 15000

function SyncButton<PayloadType extends object, ResponseType = unknown>({
  platform,
  data,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  timeout = DEFAULT_TIMEOUT,
}: SyncButtonProps<PayloadType, ResponseType>) {
  const [isLoading, setIsLoading] = useState(false)
  const isMounted = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      isMounted.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    controller: AbortController,
    timeoutMs: number
  ): Promise<ResponseType> => {
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, timeoutMs)

    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Request failed with status ${response.status}`)
      }
      return response.json() as Promise<ResponseType>
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const syncToShopify = (payload: PayloadType, controller: AbortController) => {
    const url = process.env.REACT_APP_SHOPIFY_SYNC_URL || '/api/shopify/sync'
    return fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      controller,
      timeout
    )
  }

  const syncToWooCommerce = (payload: PayloadType, controller: AbortController) => {
    const url = process.env.REACT_APP_WOOCOMMERCE_SYNC_URL || '/api/woocommerce/sync'
    return fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      controller,
      timeout
    )
  }

  const handleClick = async (): Promise<void> => {
    if (disabled || isLoading) return
    setIsLoading(true)
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      let result: ResponseType
      switch (platform) {
        case 'shopify':
          result = await syncToShopify(data, controller)
          break
        case 'woocommerce':
          result = await syncToWooCommerce(data, controller)
          break
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
      if (isMounted.current && onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      if (isMounted.current && onError) {
        if (error instanceof Error) {
          onError(error)
        } else {
          onError(new Error('Unknown error during sync'))
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  const getLabel = (): string =>
    isLoading ? 'Syncing...' : `Sync to ${platform === 'shopify' ? 'Shopify' : 'WooCommerce'}`

  return (
    <button type="button" className={className} onClick={handleClick} disabled={disabled || isLoading}>
      {getLabel()}
    </button>
  )
}

export default SyncButton