import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  GeneratedBlock,
  GeneratedCopyResult,
  MarketingFramework,
  ProductInput,
  ToneSetting,
} from './types'

interface CopyGeneratorProps {
  prompt: string
  product?: ProductInput
  onCopyGenerated?: (copy: GeneratedCopyResult) => void
  setIsGenerating?: (generating: boolean) => void
}

interface ApiResponse {
  framework?: MarketingFramework
  headline?: string
  subheadline?: string
  synopsis?: string
  html?: string
  blocks?: GeneratedBlock[]
  copy?: string
}

const DEFAULT_FRAMEWORK: MarketingFramework = 'AIDA'

const CTA_LABELS: Record<MarketingFramework, string> = {
  AIDA: 'Ready to experience it?',
  BAB: 'Bridge the gap today',
  PAS: 'Solve the problem now',
  FAB: 'See the advantage in action',
  '4Ps': 'Turn possibility into purchase',
}

const TONE_DESCRIPTIONS: Record<ToneSetting, string> = {
  balanced: 'balanced and approachable',
  conversational: 'friendly and conversational',
  professional: 'professional and authoritative',
  bold: 'bold and energetic',
  luxury: 'luxurious and premium',
  playful: 'playful and imaginative',
  technical: 'technical and detail-oriented',
  inspirational: 'inspirational and forward-looking',
}

const HEADLINE_TEMPLATES: Record<MarketingFramework, (product: ProductInput) => string> = {
  AIDA: product => `Experience ${product.title}: The Upgrade You Deserve`,
  BAB: product => `${product.title}: Imagine Before & After In One Step`,
  PAS: product => `${product.title}: Stop Struggling and Start Thriving`,
  FAB: product => `${product.title}: Features Built to Impress`,
  '4Ps': product => `${product.title}: The Perfect Solution at the Perfect Price`,
}

function pickFramework(product?: ProductInput): MarketingFramework {
  if (!product) return DEFAULT_FRAMEWORK
  const tone = product.tone ?? 'balanced'
  const description = [
    product.description,
    ...(product.keyBenefits ?? []),
    ...(product.features ?? []),
  ]
    .join(' ')
    .toLowerCase()

  if (tone === 'professional' || tone === 'technical') {
    return 'FAB'
  }
  if (tone === 'inspirational' || description.includes('dream') || description.includes('future')) {
    return 'BAB'
  }
  if (description.includes('problem') || description.includes('struggle') || tone === 'bold') {
    return 'PAS'
  }
  if (tone === 'luxury') {
    return '4Ps'
  }
  return DEFAULT_FRAMEWORK
}

function formatAudience(product: ProductInput): string | undefined {
  if (!product.targetAudience) return undefined
  return `Designed specifically for ${product.targetAudience.toLowerCase()}.`
}

function buildBlockId(type: GeneratedBlock['type'], index: number): string {
  return `${type}-${index}`
}

function ensureBullets(items?: string[]): string[] | undefined {
  if (!items) return undefined
  const unique = Array.from(new Set(items.map(item => item.trim()).filter(Boolean)))
  return unique.length > 0 ? unique : undefined
}

function summariseBenefits(product: ProductInput): string {
  const benefits = product.keyBenefits?.filter(Boolean) ?? []
  if (benefits.length === 0) {
    return 'Discover how this product elevates your day-to-day experience with meaningful results.'
  }
  if (benefits.length === 1) {
    return `What makes it special? ${benefits[0]}.`
  }
  return `Top benefits include ${benefits.slice(0, -1).join(', ')} and ${benefits.slice(-1)}.`
}

function buildBlocks(product: ProductInput, framework: MarketingFramework): GeneratedBlock[] {
  const blocks: GeneratedBlock[] = []
  const { title, keyBenefits = [], features = [], useCases = [], whatsIncluded = [], price } = product
  const formattedPrice = price ? `$${price.toFixed(2)}` : 'Great value'

  blocks.push({
    id: buildBlockId('hook', 0),
    type: 'hook',
    title: 'Hook',
    headline: HEADLINE_TEMPLATES[framework](product),
    body:
      formatAudience(product) ??
      `Meet ${title}, the modern answer for anyone ready to move beyond the ordinary.`,
  })

  blocks.push({
    id: buildBlockId('summary', 1),
    type: 'summary',
    title: 'Why it matters',
    headline: `${title} in a nutshell`,
    body: summariseBenefits(product),
  })

  if (features.length > 0) {
    blocks.push({
      id: buildBlockId('features', 2),
      type: 'features',
      title: 'Features',
      headline: 'Built with the details that matter',
      body: 'Explore the standout capabilities crafted to deliver consistent value.',
      bullets: ensureBullets(features),
    })
  }

  if (keyBenefits.length > 0) {
    blocks.push({
      id: buildBlockId('benefits', 3),
      type: 'benefits',
      title: 'Benefits',
      headline: 'Results you can feel instantly',
      body: 'Here is what you and your customers gain from every use.',
      bullets: ensureBullets(keyBenefits),
    })
  }

  if (useCases.length > 0) {
    blocks.push({
      id: buildBlockId('use_cases', 4),
      type: 'use_cases',
      title: 'Use cases',
      headline: 'Where it shines',
      body: 'See how the product fits naturally into real-life scenarios.',
      bullets: ensureBullets(useCases),
    })
  }

  if (whatsIncluded.length > 0) {
    blocks.push({
      id: buildBlockId('whats_included', 5),
      type: 'whats_included',
      title: "What's included",
      headline: 'Every package includes',
      body: 'Unbox a complete experience with the following items and services.',
      bullets: ensureBullets(whatsIncluded),
    })
  }

  const reviews = product.reviews ?? []
  if (reviews.length > 0) {
    const preview = reviews.slice(0, 2)
    blocks.push({
      id: buildBlockId('social_proof', 6),
      type: 'social_proof',
      title: 'Social proof',
      headline: 'Trusted by customers like you',
      body: preview
        .map(review => `“${review.quote}” — ${review.author}`)
        .join(' '),
    })
  }

  blocks.push({
    id: buildBlockId('cta', 7),
    type: 'cta',
    title: 'Call to action',
    headline: CTA_LABELS[framework],
    body: `${title} is available today for ${formattedPrice}. Secure yours while stocks last.`,
    callToAction: {
      label: 'Add to cart',
      description: 'Complete your purchase in just a few clicks.',
    },
  })

  return blocks
}

function renderBlockToHtml(block: GeneratedBlock): string {
  const bulletsHtml = block.bullets
    ?.map(item => `<li>${item}</li>`)
    .join('')

  const callout = block.callToAction
    ? `<div class="cta"><strong>${block.callToAction.label}</strong><p>${block.callToAction.description ?? ''}</p></div>`
    : ''

  return `
    <section class="block block-${block.type}">
      <header>
        <h2>${block.title}</h2>
        <h3>${block.headline}</h3>
      </header>
      <p>${block.body}</p>
      ${bulletsHtml ? `<ul>${bulletsHtml}</ul>` : ''}
      ${callout}
    </section>
  `
}

function buildHtmlDocument(product: ProductInput, blocks: GeneratedBlock[]): string {
  const body = blocks.map(renderBlockToHtml).join('\n')
  const keywords = [product.primaryKeyword, product.secondaryKeyword].filter(Boolean).join(', ')
  const audience = formatAudience(product)
  const toneDescription = product.tone ? `Tone: ${TONE_DESCRIPTIONS[product.tone]}.` : ''

  return `
    <article class="ai-product-page">
      <header class="hero">
        <h1>${product.title}</h1>
        <p>${product.description}</p>
        ${audience ? `<p class="audience">${audience}</p>` : ''}
        <p class="meta">${toneDescription} ${keywords ? `Keywords: ${keywords}.` : ''}</p>
      </header>
      ${body}
      <footer class="footer">
        <p class="price">From $${product.price.toFixed(2)}</p>
        <p class="cta">Ready to get started? Place your order today.</p>
      </footer>
    </article>
  `
}

function buildFallbackCopy(product: ProductInput, _prompt: string): GeneratedCopyResult {
  const framework = pickFramework(product)
  const blocks = buildBlocks(product, framework)
  const headline = HEADLINE_TEMPLATES[framework](product)
  const subheadline = product.primaryKeyword
    ? `Optimised for “${product.primaryKeyword}” and high-intent shoppers.`
    : `Crafted to delight ${product.targetAudience ?? 'modern customers'}.`

  const synopsis = `${product.title} combines ${product.features?.slice(0, 2).join(', ') || 'thoughtful design'} with ${
    product.keyBenefits?.[0] ?? 'meaningful results'
  }.`

  const html = buildHtmlDocument(product, blocks)

  return {
    framework,
    headline,
    subheadline,
    synopsis,
    blocks,
    html,
  }
}

function normaliseApiResponse(response: ApiResponse, product: ProductInput, prompt: string): GeneratedCopyResult {
  if (response.html && response.blocks && response.framework && response.headline) {
    return {
      framework: response.framework,
      headline: response.headline,
      subheadline: response.subheadline ?? product.title,
      synopsis: response.synopsis ?? product.description,
      blocks: response.blocks,
      html: response.html,
    }
  }

  if (typeof response.copy === 'string') {
    return buildFallbackCopy(product, response.copy || prompt)
  }

  return buildFallbackCopy(product, prompt)
}

const CopyGenerator: React.FC<CopyGeneratorProps> = ({
  prompt,
  product,
  onCopyGenerated,
  setIsGenerating,
}) => {
  const [result, setResult] = useState<GeneratedCopyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const resetState = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
    setIsGenerating?.(false)
  }, [setIsGenerating])

  const productSignature = useMemo(() => {
    if (!product) return ''
    return JSON.stringify({
      title: product.title,
      description: product.description,
      price: product.price,
      targetAudience: product.targetAudience,
      primaryKeyword: product.primaryKeyword,
      secondaryKeyword: product.secondaryKeyword,
      tone: product.tone,
      keyBenefits: product.keyBenefits,
      features: product.features,
      useCases: product.useCases,
      whatsIncluded: product.whatsIncluded,
      reviews: product.reviews,
    })
  }, [product])

  const readyToGenerate = Boolean(prompt && product)

  useEffect(() => {
    if (!product || !prompt) {
      resetState()
      return
    }

    let cancelled = false
    const controller = new AbortController()

    const generate = async () => {
      setLoading(true)
      setError(null)
      setIsGenerating?.(true)
      try {
        const response = await fetch('/api/generate-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, product }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = (await response.json()) as ApiResponse
        if (cancelled) return

        const copy = normaliseApiResponse(data, product, prompt)
        setResult(copy)
        onCopyGenerated?.(copy)
      } catch (err) {
        if (cancelled || !product) return
        const fallback = buildFallbackCopy(product, prompt)
        setResult(fallback)
        onCopyGenerated?.(fallback)
        const message = err instanceof Error ? err.message : 'Failed to generate copy.'
        setError(`${message} Using intelligent fallback content.`)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setIsGenerating?.(false)
        }
      }
    }

    generate()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [prompt, product, productSignature, onCopyGenerated, resetState, setIsGenerating])

  if (!readyToGenerate) {
    return (
      <div className="copy-placeholder">
        Provide product details to generate high-converting copy.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="copy-loading">
        <span className="loading-spinner" aria-hidden="true" /> Generating AI copy…
      </div>
    )
  }

  if (!result) {
    return (
      <div className="copy-placeholder">
        Unable to generate copy. Adjust your product details and try again.
      </div>
    )
  }

  return (
    <div className="copy-output">
      {error && <div className="error">{error}</div>}
      <div className="copy-output__header">
        <span className="framework-chip">Framework: {result.framework}</span>
        <div>
          <h3>{result.headline}</h3>
          <p>{result.subheadline}</p>
        </div>
      </div>
      <p className="copy-output__synopsis">{result.synopsis}</p>
      <div className="copy-output__blocks">
        {result.blocks.map(block => (
          <article key={block.id} className={`copy-card copy-card--${block.type}`}>
            <header>
              <h4>{block.title}</h4>
              <h5>{block.headline}</h5>
            </header>
            <p>{block.body}</p>
            {block.bullets && block.bullets.length > 0 && (
              <ul>
                {block.bullets.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {block.callToAction && (
              <div className="copy-card__cta">
                <strong>{block.callToAction.label}</strong>
                {block.callToAction.description && <p>{block.callToAction.description}</p>}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

export default CopyGenerator
