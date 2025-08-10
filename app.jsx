function handleGlobalError(error) {
  console.error('Global error caught:', error)
}

function renderRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/generate" element={<GeneratorPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function InitializeProviders({ children }) {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

function App() {
  useEffect(() => {
    const onError = event => handleGlobalError(event.error || new Error(event.message))
    const onRejection = event => handleGlobalError(event.reason)
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return (
    <InitializeProviders>
      <ErrorBoundary fallback={<div>Something went wrong.</div>} onError={handleGlobalError}>
        <BrowserRouter>
          {renderRoutes()}
        </BrowserRouter>
      </ErrorBoundary>
    </InitializeProviders>
  )
}

export default App