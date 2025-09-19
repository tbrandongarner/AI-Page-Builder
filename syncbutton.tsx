import React, { useEffect, useRef, useState } from 'react'

type EcommercePlatform = 'shopify' | 'woocommerce'

type SyncResult<ResponseType> = ResponseType

export interface SyncButtonProps<PayloadType extends object, ResponseType = unknown> {
  platform: EcommercePlatform
  data: PayloadType
  onSuccess?: (response: SyncResult<ResponseType>) => void
  onError?: (error: Error) => void
  disabled?: boolean
  className?: string
  timeout?: number
}

const DEFAULT_TIMEOUT = 15000

async function fetchWithTimeout<ResponseType>(
  url: string,
  options: RequestInit,
  controller: AbortController,
  timeoutMs: number,
): Promise<ResponseType> {
  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Request failed with status ${response.status}`)
    }
    return (await response.json()) as ResponseType
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function getEndpoint(platform: EcommercePlatform): string {
  if (platform === 'shopify') {
    return (window as any).REACT_APP_SHOPIFY_SYNC_URL || '/api/shopify/sync'
  }
  return (window as any).REACT_APP_WOOCOMMERCE_SYNC_URL || '/api/woocommerce/sync'
}

function getLabel(platform: EcommercePlatform, loading: boolean): string {
  if (loading) {
    return 'Syncing…'
  }
  return `Sync to ${platform === 'shopify' ? 'Shopify' : 'WooCommerce'}`
}

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
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleClick = async () => {
    if (disabled || isLoading) return
    setIsLoading(true)
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const url = getEndpoint(platform)
      const result = await fetchWithTimeout<ResponseType>(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
        controller,
        timeout,
      )
      if (isMounted.current) {
        onSuccess?.(result)
      }
    } catch (error) {
      if (isMounted.current) {
        onError?.(error instanceof Error ? error : new Error('Unknown error during sync'))
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  return (
    <button type="button" className={className} onClick={handleClick} disabled={disabled || isLoading}>
      {getLabel(platform, isLoading)}
    </button>
  )
}

export default SyncButton
