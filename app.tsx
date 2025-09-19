import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ErrorBoundary from './errorboundary'
import ProductForm from './productform'
import ScrapeForm from './scrapeform'
import CopyGenerator from './copygenerator'
import Sidebar from './sidebar'
import DashboardCard from './dashboardcard'
import PreviewToggle from './previewtoggle'
import ExportButton from './exportbutton'
import NotificationToast, { showToast } from './notificationtoast'
import type { GeneratedCopyResult, ProductInput } from './types'

const queryClient = new QueryClient()

interface GeneratorStepSummaryProps {
  product: ProductInput
}

const GeneratorStepSummary: React.FC<GeneratorStepSummaryProps> = ({ product }) => {
  const featureList = product.features?.filter(Boolean) ?? []
  const benefitList = product.keyBenefits?.filter(Boolean) ?? []
  const useCaseList = product.useCases?.filter(Boolean) ?? []

  return (
    <div className="product-summary">
      <h4>📦 Product: {product.title}</h4>
      <p className="product-price">💰 ${product.price.toFixed(2)}</p>
      <p className="product-description">{product.description}</p>
      {(product.targetAudience || product.tone || product.primaryKeyword) && (
        <div className="summary-meta">
          {product.targetAudience && (
            <div>
              <strong>Target audience:</strong> {product.targetAudience}
            </div>
          )}
          {product.tone && (
            <div>
              <strong>Preferred tone:</strong> {product.tone}
            </div>
          )}
          {product.primaryKeyword && (
            <div>
              <strong>Primary keyword:</strong> {product.primaryKeyword}
            </div>
          )}
          {product.secondaryKeyword && (
            <div>
              <strong>Secondary keyword:</strong> {product.secondaryKeyword}
            </div>
          )}
        </div>
      )}
      {featureList.length > 0 && (
        <div className="summary-list">
          <h5>Key features</h5>
          <ul>
            {featureList.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      {benefitList.length > 0 && (
        <div className="summary-list">
          <h5>Primary benefits</h5>
          <ul>
            {benefitList.map(benefit => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}
      {useCaseList.length > 0 && (
        <div className="summary-list">
          <h5>Use cases</h5>
          <ul>
            {useCaseList.map(useCase => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const GeneratorPage: React.FC = () => {
  const [productData, setProductData] = useState<ProductInput | null>(null)
  const [activeTab, setActiveTab] = useState<'manual' | 'scrape'>('manual')
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedCopyResult | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showStructuredPreview, setShowStructuredPreview] = useState(true)
  const htmlPreviewRef = useRef<HTMLDivElement>(null)

  const handleProductSubmit = (data: ProductInput) => {
    setProductData(data)
    setCurrentStep(2)
    setGeneratedCopy(null)
  }

  const handleScrapeComplete = (scrapedData: ProductInput) => {
    setProductData(scrapedData)
    setActiveTab('manual')
    setCurrentStep(2)
    setGeneratedCopy(null)
  }

  const handleCopyGenerated = (copy: GeneratedCopyResult) => {
    setGeneratedCopy(copy)
    setCurrentStep(3)
  }

  const generatePrompt = useMemo(() => {
    if (!productData) return ''

    const keywords = [productData.primaryKeyword, productData.secondaryKeyword]
      .filter(Boolean)
      .join(', ')

    const context = [
      productData.targetAudience ? `Target audience: ${productData.targetAudience}.` : null,
      keywords ? `Focus keywords: ${keywords}.` : null,
      productData.tone ? `Preferred tone: ${productData.tone}.` : null,
    ]
      .filter(Boolean)
      .join(' ')

    const promptSegments = [
      `Create a persuasive product page with hook, benefits, features, specs, use cases, what's included, reviews, and CTA for ${productData.title}.`,
      context,
      `Base description: ${productData.description}.`,
      `Price: $${productData.price.toFixed(2)}.`,
    ]

    return promptSegments.filter(Boolean).join(' ')
  }, [productData])

  const resetGenerator = () => {
    setProductData(null)
    setGeneratedCopy(null)
    setCurrentStep(1)
    setActiveTab('manual')
    setShowStructuredPreview(true)
  }

  const handleCopyHtml = async () => {
    if (!generatedCopy) return
    try {
      await navigator.clipboard.writeText(generatedCopy.html)
      showToast('Generated copy copied to clipboard.', 'success')
    } catch (error) {
      console.error('Failed to copy generated copy', error)
      showToast('Unable to copy the generated copy.', 'error')
    }
  }

  const renderBlocks = () => {
    if (!generatedCopy) return null

    return (
      <div className="structured-preview">
        <header className="structured-preview__header">
          <span className="framework-chip">Framework: {generatedCopy.framework}</span>
          <h3>{generatedCopy.headline}</h3>
          <p>{generatedCopy.subheadline}</p>
          <p className="structured-preview__synopsis">{generatedCopy.synopsis}</p>
        </header>
        <div className="structured-preview__blocks">
          {generatedCopy.blocks.map(block => (
            <section key={block.id} className={`preview-block preview-block--${block.type}`}>
              <h4>{block.title}</h4>
              <h5>{block.headline}</h5>
              <p>{block.body}</p>
              {block.bullets && block.bullets.length > 0 && (
                <ul>
                  {block.bullets.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {block.callToAction && (
                <div className="preview-block__cta">
                  <strong>{block.callToAction.label}</strong>
                  {block.callToAction.description && <p>{block.callToAction.description}</p>}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    )
  }

  const renderHtmlPreview = () => {
    if (!generatedCopy) return null

    return (
      <div
        ref={htmlPreviewRef}
        className={`html-preview${showStructuredPreview ? ' html-preview--hidden' : ''}`}
        dangerouslySetInnerHTML={{ __html: generatedCopy.html }}
      />
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Page Generator</h1>
        <p>Create compelling product pages with AI assistance in 3 simple steps</p>
      </div>

      <div className="generator-progress">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Product Info</div>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Generate Copy</div>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Preview & Export</div>
        </div>
      </div>

      <div className="generator-content">
        {currentStep === 1 && (
          <div className="generator-step">
            <DashboardCard
              title="Step 1: Product Information"
              subtitle="Enter your product details or scrape from a URL"
              className="step-card"
            >
              <div className="input-tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
                >
                  📝 Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('scrape')}
                  className={`tab-button ${activeTab === 'scrape' ? 'active' : ''}`}
                >
                  🔗 URL Scraping
                </button>
              </div>

              {activeTab === 'manual' && (
                <div className="tab-content">
                  <ProductForm onSubmit={handleProductSubmit} initialValues={productData ?? undefined} />
                </div>
              )}

              {activeTab === 'scrape' && (
                <div className="tab-content">
                  <ScrapeForm onScrapeComplete={handleScrapeComplete} />
                </div>
              )}
            </DashboardCard>
          </div>
        )}

        {currentStep === 2 && productData && (
          <div className="generator-step">
            <DashboardCard
              title="Step 2: Generate AI Copy"
              subtitle="Create compelling marketing content with AI"
              className="step-card"
            >
              <GeneratorStepSummary product={productData} />

              <div className="copy-generation">
                <CopyGenerator
                  prompt={generatePrompt}
                  product={productData}
                  onCopyGenerated={handleCopyGenerated}
                />
              </div>

              <div className="step-actions">
                <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary">
                  ← Back to Product Info
                </button>
              </div>
            </DashboardCard>
          </div>
        )}

        {currentStep === 3 && generatedCopy && (
          <div className="generator-step">
            <DashboardCard
              title="Step 3: Preview & Export"
              subtitle="Review your generated page and export"
              className="step-card"
            >
              <div className="preview-toolbar">
                <div className="preview-buttons">
                  <PreviewToggle
                    initialPreview={showStructuredPreview}
                    onToggle={value => setShowStructuredPreview(value)}
                    activeLabel="Structured preview"
                    inactiveLabel="Show HTML"
                    className="btn-secondary"
                  />
                  <button type="button" className="btn-secondary" onClick={handleCopyHtml}>
                    📋 Copy HTML
                  </button>
                  <ExportButton
                    contentRef={htmlPreviewRef}
                    filename={`${productData?.title || 'product'}-page.html`}
                    title={generatedCopy.headline}
                    className="btn-primary"
                  />
                </div>
                <button type="button" className="btn-outline" onClick={resetGenerator}>
                  🔄 Start Over
                </button>
              </div>

              <div className="preview-body">
                {showStructuredPreview ? renderBlocks() : null}
                {renderHtmlPreview()}
              </div>

              <div className="step-actions">
                <button type="button" onClick={() => setCurrentStep(2)} className="btn-secondary">
                  ← Edit Copy
                </button>
                <button
                  type="button"
                  className="btn-success"
                  onClick={() => showToast('Project saved locally. Connect an integration to sync.', 'info')}
                >
                  ✅ Save Project
                </button>
              </div>
            </DashboardCard>
          </div>
        )}
      </div>
    </div>
  )
}

const quickStats = [
  { label: 'Total Projects', value: '12', change: '+3 this month' },
  { label: 'Active Campaigns', value: '5', change: '+2 this week' },
  { label: 'Conversion Rate', value: '18.5%', change: '+2.3% vs last month' },
  { label: 'Generated Pages', value: '47', change: '+12 this month' },
]

const recentProjects = [
  { id: 1, name: 'Summer Collection Landing', status: 'Active', lastModified: '2 hours ago', performance: '+15%' },
  { id: 2, name: 'Tech Gadgets Campaign', status: 'Draft', lastModified: '1 day ago', performance: 'N/A' },
  { id: 3, name: 'Holiday Sale Page', status: 'Published', lastModified: '3 days ago', performance: '+28%' },
]

const HomePage: React.FC = () => (
  <div className="dashboard-page">
    <div className="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome back! Here&apos;s what&apos;s happening with your projects.</p>
    </div>

    <div className="dashboard-stats">
      {quickStats.map(stat => (
        <DashboardCard
          key={stat.label}
          title={stat.value}
          subtitle={stat.label}
          badge={stat.change}
          className="stat-card"
        />
      ))}
    </div>

    <div className="dashboard-content">
      <div className="dashboard-main">
        <DashboardCard title="Recent Projects" subtitle="Your latest work" className="projects-card">
          <div className="projects-list">
            {recentProjects.map(project => (
              <div key={project.id} className="project-item">
                <div className="project-info">
                  <h4>{project.name}</h4>
                  <span className={`status status-${project.status.toLowerCase()}`}>{project.status}</span>
                </div>
                <div className="project-meta">
                  <span className="last-modified">{project.lastModified}</span>
                  <span className="performance">{project.performance}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card-actions">
            <Link to="/generator" className="btn btn-primary">
              View All Projects
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Actions" subtitle="Get started quickly" className="actions-card">
          <div className="quick-actions">
            <Link to="/generator" className="action-item">
              <span className="action-icon">🚀</span>
              <div>
                <h4>Create New Page</h4>
                <p>Start building a new product page</p>
              </div>
            </Link>
            <Link to="/generator" className="action-item">
              <span className="action-icon">📝</span>
              <div>
                <h4>Generate Copy</h4>
                <p>Create AI-powered content</p>
              </div>
            </Link>
            <Link to="/settings" className="action-item">
              <span className="action-icon">⚙️</span>
              <div>
                <h4>Configure Settings</h4>
                <p>Manage your preferences</p>
              </div>
            </Link>
          </div>
        </DashboardCard>
      </div>

      <div className="dashboard-sidebar">
        <DashboardCard title="Performance Overview" subtitle="Last 30 days" className="performance-card">
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">Page Views</span>
              <span className="metric-value">24,567</span>
              <span className="metric-change positive">+12%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Conversions</span>
              <span className="metric-value">1,234</span>
              <span className="metric-change positive">+8%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Revenue</span>
              <span className="metric-value">$45,678</span>
              <span className="metric-change positive">+15%</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Activity" subtitle="Latest updates" className="activity-card">
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">2h ago</span>
              <p>Generated new copy for Summer Collection</p>
            </div>
            <div className="activity-item">
              <span className="activity-time">5h ago</span>
              <p>Published Holiday Sale campaign</p>
            </div>
            <div className="activity-item">
              <span className="activity-time">1d ago</span>
              <p>Updated Tech Gadgets landing page</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  </div>
)

const PlaceholderPage: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="page-container">
    <div className="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    <div className="placeholder-content">
      <p>This section is under construction. Your upcoming integrations and reports will appear here.</p>
    </div>
  </div>
)

const SettingsPage: React.FC = () => (
  <div className="page-container">
    <div className="page-header">
      <h1>Settings</h1>
      <p>Configure your AI page builder preferences and integrations.</p>
    </div>

    <div className="settings-grid">
      <section>
        <h3>AI Configuration</h3>
        <div className="form-group">
          <label htmlFor="openai-key" className="form-label">
            OpenAI API Key
          </label>
          <input id="openai-key" type="password" placeholder="sk-..." className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="default-framework" className="form-label">
            Default Copy Framework
          </label>
          <select id="default-framework" className="form-input">
            <option value="AIDA">AIDA (Attention, Interest, Desire, Action)</option>
            <option value="PAS">PAS (Problem, Agitation, Solution)</option>
            <option value="BAB">BAB (Before, After, Bridge)</option>
          </select>
        </div>
      </section>

      <section>
        <h3>E-commerce Integrations</h3>
        <div className="form-group">
          <label htmlFor="shopify-url" className="form-label">
            Shopify Store URL
          </label>
          <input id="shopify-url" type="text" placeholder="your-store.myshopify.com" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="shopify-token" className="form-label">
            Shopify Access Token
          </label>
          <input id="shopify-token" type="password" placeholder="shpat_..." className="form-input" />
        </div>
      </section>

      <button type="button" className="btn-primary settings-save">
        Save Settings
      </button>
    </div>
  </div>
)

const NotFoundPage: React.FC = () => (
  <div className="not-found">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
    <div className="not-found-actions">
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
      <Link to="/generator" className="btn btn-success">
        AI Generator
      </Link>
    </div>
  </div>
)

function handleGlobalError(error: Error) {
  console.error('Global error caught:', error)
}

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)

const App: React.FC = () => {
  useEffect(() => {
    const onError = (event: ErrorEvent) => handleGlobalError(event.error || new Error(event.message))
    const onRejection = (event: PromiseRejectionEvent) => handleGlobalError(event.reason instanceof Error ? event.reason : new Error('Unhandled rejection'))

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return (
    <AppProviders>
      <ErrorBoundary fallback={<div>Something went wrong.</div>} onError={handleGlobalError}>
        <BrowserRouter>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/generator" element={<GeneratorPage />} />
                <Route path="/projects" element={<PlaceholderPage title="Projects" description="Manage all your AI-generated product pages and campaigns." />} />
                <Route path="/analytics" element={<PlaceholderPage title="Analytics" description="Track performance and insights for your product pages." />} />
                <Route path="/templates" element={<PlaceholderPage title="Templates" description="Choose from pre-designed templates for your product pages." />} />
                <Route path="/integrations" element={<PlaceholderPage title="Integrations" description="Connect your favourite tools and platforms." />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
      <NotificationToast />
    </AppProviders>
  )
}

export default App
