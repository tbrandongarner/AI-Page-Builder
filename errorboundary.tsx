import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  fallbackRender?: (props: { error: Error; resetError: () => void }) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
    this.resetError = this.resetError.bind(this)
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  resetError() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback, fallbackRender } = this.props

    if (hasError) {
      if (fallbackRender) {
        return <>{fallbackRender({ error: error!, resetError: this.resetError })}</>
      }
      return (
        <div role="alert">
          {fallback ?? (
            <div>
              <p>Something went wrong.</p>
              {process.env.NODE_ENV !== 'production' && error && (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {error.stack || error.message}
                </pre>
              )}
            </div>
          )}
          <button type="button" onClick={this.resetError}>
            Try again
          </button>
        </div>
      )
    }

    return <>{children}</>
  }
}

export default ErrorBoundary