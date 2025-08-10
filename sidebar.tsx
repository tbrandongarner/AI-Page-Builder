function Sidebar({ sections, className = '' }: SidebarProps): JSX.Element {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setOpenSections(prev => {
      const filtered: Record<string, boolean> = {}
      sections.forEach(({ id }) => {
        if (id in prev) {
          filtered[id] = prev[id]
        }
      })
      return filtered
    })
  }, [sections])

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  return (
    <aside className={`sidebar ${className}`.trim()}>
      {sections.map(section => (
        <SectionItem
          key={section.id}
          section={section}
          isOpen={!!openSections[section.id]}
          onToggle={toggleSection}
        />
      ))}
    </aside>
  )
}

interface SectionItemProps {
  section: Section
  isOpen: boolean
  onToggle: (id: string) => void
}

const SectionItem = memo(function SectionItem({ section, isOpen, onToggle }: SectionItemProps) {
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

export default Sidebar