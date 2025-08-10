const AVAILABLE_FRAMEWORKS: Framework[] = [
  'React',
  'Next.js',
  'Gatsby',
  'Angular',
  'Vue.js',
  'Svelte',
  'Ember.js',
]

const getRecommendedFrameworks = (content: string): Framework[] => {
  const lower = content.toLowerCase()
  const recommendations = new Set<Framework>()

  if (lower.includes('ssr') || lower.includes('server side')) {
    recommendations.add('Next.js')
  }
  if (lower.includes('static')) {
    recommendations.add('Gatsby')
  }
  if (lower.includes('react') || lower.includes('hooks')) {
    recommendations.add('React')
  }
  if (lower.includes('angular') || lower.includes('typescript')) {
    recommendations.add('Angular')
  }
  if (lower.includes('vue')) {
    recommendations.add('Vue.js')
  }
  if (lower.includes('svelte')) {
    recommendations.add('Svelte')
  }
  if (lower.includes('ember')) {
    recommendations.add('Ember.js')
  }

  return Array.from(recommendations)
}

const formatFrameworkOption = (option: Framework): string =>
  option.replace(/\./g, '').replace(/\b\w/g, char => char.toUpperCase())

interface FrameworkSelectorProps {
  content: string
  selectedFramework?: Framework
  onSelectFramework: (framework: Framework) => void
}

const FrameworkSelector: FC<FrameworkSelectorProps> = ({
  content,
  selectedFramework,
  onSelectFramework,
}) => {
  const options = useMemo(() => getRecommendedFrameworks(content), [content])

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onSelectFramework(e.target.value as Framework)
  }

  return (
    <div className="framework-selector">
      <label htmlFor="framework-select">Select Framework:</label>
      <select
        id="framework-select"
        value={selectedFramework || ''}
        onChange={handleChange}
      >
        <option value="" disabled>
          -- Choose a framework --
        </option>
        {options.length > 0 ? (
          options.map(option => (
            <option key={option} value={option}>
              {formatFrameworkOption(option)}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No recommendations available
          </option>
        )}
      </select>
    </div>
  )
}

export default FrameworkSelector