import React, { memo, useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface Section {
  id: string
  title: string
  content: React.ReactNode
}

interface SidebarProps {
  sections?: Section[]
  className?: string
}

interface NavigationItem {
  id: string
  title: string
  path: string
  icon: string
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/',
    icon: '📊',
    description: 'View your projects',
  },
  {
    id: 'generator',
    title: 'AI Generator',
    path: '/generator',
    icon: '🤖',
    description: 'Create product pages with AI',
  },
  {
    id: 'projects',
    title: 'Projects',
    path: '/projects',
    icon: '📁',
    description: 'Manage your projects',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    path: '/analytics',
    icon: '📈',
    description: 'View performance metrics',
  },
  {
    id: 'templates',
    title: 'Templates',
    path: '/templates',
    icon: '📄',
    description: 'Browse page templates',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    path: '/integrations',
    icon: '🔗',
    description: 'Connect external services',
  },
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings',
    icon: '⚙️',
    description: 'Configure your preferences',
  },
]

const Sidebar: React.FC<SidebarProps> = ({ sections, className = '' }) => {
  const location = useLocation()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!sections || sections.length === 0) {
      setOpenSections({})
      return
    }

    setOpenSections(prev => {
      const updated: Record<string, boolean> = {}
      sections.forEach(section => {
        updated[section.id] = prev[section.id] ?? false
      })
      return updated
    })
  }, [sections])

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  return (
    <aside className={`sidebar ${className}`.trim()}>
      <div className="sidebar__header">
        <h2 className="sidebar__title">AI Page Builder</h2>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        <h3 className="sidebar__nav-title">Navigation</h3>
        <ul className="sidebar__nav-list">
          {navigationItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.id} className="sidebar__nav-item">
                <Link
                  to={item.path}
                  className={`sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`}
                  title={item.description}
                >
                  <span className="sidebar__nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="sidebar__nav-text">{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {sections && sections.length > 0 && (
        <div className="sidebar__sections">
          <h3 className="sidebar__sections-title">Sections</h3>
          {sections.map(section => (
            <SectionItem
              key={section.id}
              section={section}
              isOpen={Boolean(openSections[section.id])}
              onToggle={toggleSection}
            />
          ))}
        </div>
      )}
    </aside>
  )
}

interface SectionItemProps {
  section: Section
  isOpen: boolean
  onToggle: (id: string) => void
}

const SectionItem = memo(({ section, isOpen, onToggle }: SectionItemProps) => {
  const handleClick = useCallback(() => {
    onToggle(section.id)
  }, [onToggle, section.id])

  return (
    <div className="sidebar__section">
      <button
        id={`sidebar-header-${section.id}`}
        className="sidebar__toggle"
        onClick={handleClick}
        aria-controls={`sidebar-content-${section.id}`}
        aria-expanded={isOpen}
        type="button"
      >
        {section.title}
      </button>
      {isOpen && (
        <div
          id={`sidebar-content-${section.id}`}
          className="sidebar__content"
          role="region"
          aria-labelledby={`sidebar-header-${section.id}`}
        >
          {section.content}
        </div>
      )}
    </div>
  )
})

SectionItem.displayName = 'SectionItem'

export default Sidebar
