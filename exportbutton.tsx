const ExportButton: React.FC<ExportButtonProps> = ({
  contentRef,
  filename = 'product-page.html',
  title = 'Product Page',
  className = '',
}) => {
  const generateHTML = useCallback((): string => {
    const rawContent = contentRef.current?.innerHTML || ''
    const sanitizedContent = DOMPurify.sanitize(rawContent, { USE_PROFILES: { html: true } })
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body>
${sanitizedContent}
</body>
</html>`
  }, [contentRef, title])

  const handleExport = useCallback(() => {
    if (!contentRef.current?.innerHTML.trim()) {
      alert('There is no content to export.')
      return
    }
    const html = generateHTML()
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  }, [contentRef, generateHTML, filename])

  const isDisabled = !contentRef.current?.innerHTML.trim()

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled}
      className={className}
    >
      Export HTML
    </button>
  )
}

export default ExportButton