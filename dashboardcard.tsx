import React, { FC, KeyboardEvent, ReactNode, useCallback } from 'react'

interface DashboardCardProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  badge?: string | number
  onClick?: () => void
  className?: string
  children?: ReactNode
  footer?: ReactNode
}

const DashboardCard: FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  onClick,
  className = '',
  children,
  footer,
}) => {
  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return
      const { key } = event
      if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
        event.preventDefault()
        onClick()
      }
    },
    [onClick],
  )

  return (
    <div
      className={`dashboard-card ${className}`.trim()}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      {icon && <div className="dashboard-card-icon">{icon}</div>}
      <div className="dashboard-card-body">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">{title}</h3>
          {badge && <span className="dashboard-card-badge">{badge}</span>}
        </div>
        {subtitle && <p className="dashboard-card-subtitle">{subtitle}</p>}
        {children}
      </div>
      {footer && <div className="dashboard-card-footer">{footer}</div>}
    </div>
  )
}

function areEqual(prevProps: DashboardCardProps, nextProps: DashboardCardProps) {
  return (
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.className === nextProps.className &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.icon === nextProps.icon &&
    prevProps.badge === nextProps.badge &&
    prevProps.footer === nextProps.footer &&
    prevProps.children === nextProps.children
  )
}

export default React.memo(DashboardCard, areEqual)
