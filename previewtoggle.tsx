import React, { FC, useCallback, useState } from 'react'

interface PreviewToggleProps {
  initialPreview?: boolean
  onToggle?: (isPreview: boolean) => void
  activeLabel?: string
  inactiveLabel?: string
  className?: string
}

const PreviewToggle: FC<PreviewToggleProps> = ({
  initialPreview = false,
  onToggle,
  activeLabel = 'Preview',
  inactiveLabel = 'Switch to preview',
  className = '',
}) => {
  const [isPreview, setIsPreview] = useState<boolean>(initialPreview)

  const toggleView = useCallback(() => {
    setIsPreview(prev => {
      const next = !prev
      onToggle?.(next)
      return next
    })
  }, [onToggle])

  return (
    <button
      type="button"
      onClick={toggleView}
      aria-pressed={isPreview}
      aria-label={isPreview ? activeLabel : inactiveLabel}
      className={`preview-toggle${isPreview ? ' preview-toggle--active' : ''}${className ? ` ${className}` : ''}`}
    >
      {isPreview ? activeLabel : inactiveLabel}
    </button>
  )
}

export default React.memo(PreviewToggle)
