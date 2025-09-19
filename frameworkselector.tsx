import React, { ChangeEvent, FC, useMemo } from 'react'
import type { MarketingFramework } from './types'

const AVAILABLE_FRAMEWORKS: MarketingFramework[] = ['AIDA', 'PAS', 'BAB', 'FAB', '4Ps']

interface FrameworkSelectorProps {
  content: string
  selectedFramework?: MarketingFramework
  onSelectFramework: (framework: MarketingFramework) => void
}

const keywordFrameworkMap: Array<{ framework: MarketingFramework; keywords: RegExp[] }> = [
  { framework: 'AIDA', keywords: [/attention/i, /desire/i, /action/i] },
  { framework: 'PAS', keywords: [/problem/i, /pain/i, /struggle/i, /solution/i] },
  { framework: 'BAB', keywords: [/before/i, /after/i, /bridge/i] },
  { framework: 'FAB', keywords: [/feature/i, /advantage/i, /benefit/i] },
  { framework: '4Ps', keywords: [/promise/i, /proof/i, /price/i, /promotion/i] },
]

function getRecommendedFrameworks(content: string): MarketingFramework[] {
  const lower = content.toLowerCase()
  const recommendations = new Set<MarketingFramework>()

  keywordFrameworkMap.forEach(({ framework, keywords }) => {
    if (keywords.some(regex => regex.test(lower))) {
      recommendations.add(framework)
    }
  })

  if (recommendations.size === 0) {
    return AVAILABLE_FRAMEWORKS
  }

  return Array.from(recommendations)
}

const FrameworkSelector: FC<FrameworkSelectorProps> = ({ content, selectedFramework, onSelectFramework }) => {
  const options = useMemo(() => getRecommendedFrameworks(content), [content])

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSelectFramework(event.target.value as MarketingFramework)
  }

  return (
    <div className="framework-selector">
      <label htmlFor="framework-select">Preferred framework</label>
      <select
        id="framework-select"
        value={selectedFramework ?? ''}
        onChange={handleChange}
        className="form-input"
      >
        <option value="" disabled>
          {options.length === 0 ? 'No frameworks detected' : 'Choose a framework'}
        </option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FrameworkSelector
