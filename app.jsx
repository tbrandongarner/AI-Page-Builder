import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ErrorBoundary from './errorboundary.tsx'
import ProductForm from './productform.tsx'
import ScrapeForm from './scrapeform.tsx'
import CopyGenerator from './copygenerator.tsx'
import Sidebar from './sidebar.tsx'
import DashboardCard from './dashboardcard.tsx'

// Placeholder page components
const ProjectsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Projects</h1>
        <p>Manage all your AI-generated product pages and campaigns</p>
      </div>
      <div className="projects-grid">
        <DashboardCard
          title="Create New Project"
          subtitle="Start a new product page"
          icon="➕"
          onClick={() => window.location.href = '/generator'}
          className="create-project-card"
        />
        <DashboardCard
          title="Summer Collection"
          subtitle="Active • Last edited 2 hours ago"
          badge="Live"
          className="project-card"
        />
        <DashboardCard
          title="Tech Gadgets Campaign"
          subtitle="Draft • Last edited 1 day ago"
          badge="Draft"
          className="project-card"
        />
      </div>
    </div>
  )
}

const AnalyticsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Track performance and insights for your product pages</p>
      </div>
      <div className="analytics-dashboard">
        <div className="analytics-stats">
          <DashboardCard title="24,567" subtitle="Total Page Views" badge="+12% vs last month" className="analytics-card" />
          <DashboardCard title="1,234" subtitle="Conversions" badge="+8% vs last month" className="analytics-card" />
          <DashboardCard title="18.5%" subtitle="Conversion Rate" badge="+2.3% vs last month" className="analytics-card" />
          <DashboardCard title="$45,678" subtitle="Revenue Generated" badge="+15% vs last month" className="analytics-card" />
        </div>
      </div>
    </div>
  )
}

const TemplatesPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Templates</h1>
        <p>Choose from pre-designed templates for your product pages</p>
      </div>
      <div className="templates-grid">
        <DashboardCard
          title="E-commerce Classic"
          subtitle="Perfect for online stores"
          badge="Popular"
          className="template-card"
        />
        <DashboardCard
          title="Tech Product Launch"
          subtitle="Ideal for tech products"
          badge="New"
          className="template-card"
        />
        <DashboardCard
          title="Fashion Collection"
          subtitle="Great for fashion brands"
          className="template-card"
        />
      </div>
    </div>
  )
}

const IntegrationsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Integrations</h1>
        <p>Connect your favorite tools and platforms</p>
      </div>
      <div className="integrations-grid">
        <DashboardCard
          title="Shopify"
          subtitle="Connect your Shopify store"
          badge="Connected"
          className="integration-card"
        />
        <DashboardCard
          title="WooCommerce"
          subtitle="Sync with WooCommerce"
          badge="Available"
          className="integration-card"
        />
        <DashboardCard
          title="Mailchimp"
          subtitle="Email marketing integration"
          badge="Available"
          className="integration-card"
        />
      </div>
    </div>
  )
}

function HomePage() {
  const recentProjects = [
    { id: 1, name: 'Summer Collection Landing', status: 'Active', lastModified: '2 hours ago', performance: '+15%' },
    { id: 2, name: 'Tech Gadgets Campaign', status: 'Draft', lastModified: '1 day ago', performance: 'N/A' },
    { id: 3, name: 'Holiday Sale Page', status: 'Published', lastModified: '3 days ago', performance: '+28%' }
  ]

  const quickStats = [
    { label: 'Total Projects', value: '12', change: '+3 this month' },
    { label: 'Active Campaigns', value: '5', change: '+2 this week' },
    { label: 'Conversion Rate', value: '18.5%', change: '+2.3% vs last month' },
    { label: 'Generated Pages', value: '47', change: '+12 this month' }
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your projects.</p>
      </div>

      <div className="dashboard-stats">
        {quickStats.map((stat, index) => (
          <DashboardCard
            key={index}
            title={stat.value}
            subtitle={stat.label}
            badge={stat.change}
            className="stat-card"
          />
        ))}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <DashboardCard
            title="Recent Projects"
            subtitle="Your latest work"
            className="projects-card"
          >
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
              <Link to="/generator" className="btn btn-primary">View All Projects</Link>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Quick Actions"
            subtitle="Get started quickly"
            className="actions-card"
          >
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
          <DashboardCard
            title="Performance Overview"
            subtitle="Last 30 days"
            className="performance-card"
          >
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

          <DashboardCard
            title="Recent Activity"
            subtitle="Latest updates"
            className="activity-card"
          >
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
}

function GeneratorPage() {
  const [productData, setProductData] = React.useState(null)
  const [activeTab, setActiveTab] = React.useState('manual') // 'manual' or 'scrape'
  const [generatedCopy, setGeneratedCopy] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(1)

  const handleProductSubmit = (data) => {
    setProductData(data)
    setCurrentStep(2)
    console.log('Product data received:', data)
  }

  const handleScrapeComplete = (scrapedData) => {
    setProductData(scrapedData)
    setActiveTab('manual') // Switch to manual tab to show scraped data
    setCurrentStep(2)
    console.log('Scraped data received:', scrapedData)
  }

  const handleCopyGenerated = (copy) => {
    setGeneratedCopy(copy)
    setCurrentStep(3)
  }

  const generatePrompt = () => {
    if (!productData) return ''
    return `Create compelling marketing copy for: ${productData.title}. Description: ${productData.description}. Price: $${productData.price}. Focus on benefits and conversion.`
  }

  const resetGenerator = () => {
    setProductData(null)
    setGeneratedCopy('')
    setCurrentStep(1)
    setActiveTab('manual')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Page Generator</h1>
        <p>Create compelling product pages with AI assistance in 3 simple steps</p>
      </div>

      {/* Progress Steps */}
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
                  onClick={() => setActiveTab('manual')}
                  className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
                >
                  📝 Manual Entry
                </button>
                <button 
                  onClick={() => setActiveTab('scrape')}
                  className={`tab-button ${activeTab === 'scrape' ? 'active' : ''}`}
                }>
                  🔗 URL Scraping
                </button>
              </div>

              {activeTab === 'manual' && (
                <div className="tab-content">
                  <ProductForm onSubmit={handleProductSubmit} initialValues={productData} />
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
              <div className="product-summary">
                <h4>📦 Product: {productData.title}</h4>
                <p className="product-price">💰 ${productData.price}</p>
                <p className="product-description">{productData.description}</p>
              </div>
              
              <div className="copy-generation">
                <CopyGenerator 
                  prompt={generatePrompt()} 
                  onCopyGenerated={handleCopyGenerated}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                />
              </div>

              <div className="step-actions">
                <button onClick={() => setCurrentStep(1)} className="btn-secondary">
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
              <div className="preview-section">
                <div className="preview-header">
                  <h4>🎯 Generated Marketing Copy</h4>
                  <div className="preview-actions">
                    <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(generatedCopy)}>
                      📋 Copy Text
                    </button>
                    <button className="btn-primary">
                      📄 Export as HTML
                    </button>
                  </div>
                </div>
                
                <div className="copy-preview">
                  <div dangerouslySetInnerHTML={{ __html: generatedCopy.replace(/\n/g, '<br>') }} />
                </div>
              </div>

              <div className="step-actions">
                <button onClick={() => setCurrentStep(2)} className="btn-secondary">
                  ← Edit Copy
                </button>
                <button onClick={resetGenerator} className="btn-outline">
                  🔄 Start Over
                </button>
                <button className="btn-success">
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

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <p>Configure your AI page builder preferences and integrations.</p>
      
      <div style={{ marginTop: '30px' }}>
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
          <h3>AI Configuration</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>OpenAI API Key</label>
            <input type="password" placeholder="sk-..." style={{ width: '100%', maxWidth: '400px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Default Copy Framework</label>
            <select style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option>AIDA (Attention, Interest, Desire, Action)</option>
              <option>PAS (Problem, Agitation, Solution)</option>
              <option>BAB (Before, After, Bridge)</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
          <h3>E-commerce Integrations</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Shopify Store URL</label>
            <input type="text" placeholder="your-store.myshopify.com" style={{ width: '100%', maxWidth: '400px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Shopify Access Token</label>
            <input type="password" placeholder="shpat_..." style={{ width: '100%', maxWidth: '400px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
        </div>
        
        <button style={{ padding: '12px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Settings
        </button>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 style={{ fontSize: '4rem', margin: '0', color: '#6c757d' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: '#6c757d', marginBottom: '30px' }}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <a href="/" style={{ padding: '10px 20px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Go Home</a>
        <a href="/generator" style={{ padding: '10px 20px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>AI Generator</a>
      </div>
    </div>
  )
}

function handleGlobalError(error) {
  console.error('Global error caught:', error)
}

function renderRoutes() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

function InitializeProviders({ children }) {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

function App() {
  useEffect(() => {
    const onError = event => handleGlobalError(event.error || new Error(event.message))
    const onRejection = event => handleGlobalError(event.reason)
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return (
    <InitializeProviders>
      <ErrorBoundary fallback={<div>Something went wrong.</div>} onError={handleGlobalError}>
        <BrowserRouter>
          {renderRoutes()}
        </BrowserRouter>
      </ErrorBoundary>
    </InitializeProviders>
  )
}

export default App