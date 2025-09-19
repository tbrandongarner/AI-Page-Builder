import React, { MutableRefObject, useCallback } from 'react'

interface ExportButtonProps {
  contentRef: MutableRefObject<HTMLElement | null>
  filename?: string
  title?: string
  className?: string
}

function sanitiseHtml(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html
  template.content.querySelectorAll('script, style, iframe, object, embed').forEach(el => el.remove())
  return template.innerHTML
}

const ExportButton: React.FC<ExportButtonProps> = ({
  contentRef,
  filename = 'product-page.html',
  title = 'Product Page',
  className = '',
}) => {
  const generateHTML = useCallback((): string => {
    const rawContent = contentRef.current?.innerHTML ?? ''
    const sanitisedContent = sanitiseHtml(rawContent)
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .ai-product-page { max-width: 960px; margin: 0 auto; }
    .ai-product-page header { margin-bottom: 24px; }
    .block { margin-bottom: 32px; }
    .block h2 { font-size: 1.25rem; margin-bottom: 8px; }
    .block h3 { font-size: 1rem; margin-bottom: 12px; color: #444; }
    .block ul { padding-left: 20px; }
    .cta { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 12px; }
  </style>
</head>
<body>
${sanitisedContent}
</body>
</html>`
  }, [contentRef, title])

  const handleExport = useCallback(() => {
    const htmlContainer = contentRef.current
    if (!htmlContainer || htmlContainer.innerHTML.trim().length === 0) {
      window.alert('There is no content to export.')
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
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [contentRef, generateHTML, filename])

  const currentHtml = contentRef.current?.innerHTML ?? ''
  const isDisabled = currentHtml.trim().length === 0

  return (
    <button type="button" onClick={handleExport} disabled={isDisabled} className={className}>
      Export HTML
    </button>
  )
}

export default ExportButton
