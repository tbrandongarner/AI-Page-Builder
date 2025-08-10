const { hasError, error } = this.state
    const { children, fallback, fallbackRender } = this.props

    if (hasError) {
      if (fallbackRender) {
        return <>{fallbackRender({ error, resetError: this.resetError })}</>
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