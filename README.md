# ai-page-builder

## Project Description

**ai-page-builder** is a React/Next.js application that automates the creation of high-converting e-commerce product pages. By combining intelligent web scraping, AI-powered copywriting frameworks, image handling, and direct e-commerce platform synchronization (Shopify & WooCommerce), store owners and marketers can generate SEO-optimized landing pages in minutes?no manual research or copywriting required.

---

## Table of Contents

1. [Features](#features)  
2. [Architecture Overview](#architecture-overview)  
3. [Getting Started](#getting-started)  
4. [Usage](#usage)  
5. [Environment Variables](#environment-variables)  
6. [Directory Structure](#directory-structure)  
7. [Component List](#component-list)  
8. [Dependencies](#dependencies)  
9. [Scripts](#scripts)  
10. [Contributing](#contributing)  
11. [License](#license)  

---

## Features

- Dual input workflow:  
  - **URL Scraping** with Puppeteer/Cheerio  
  - **Manual Entry** of product details  
- AI-driven copy generation using GPT-4, Claude, Straico, or OpenRouter  
- Framework recommendation engine (AIDA, PAS, BAB, etc.)  
- Live product page preview (mobile/desktop) with in-place editing  
- Responsive HTML export with inline CSS & optimized images  
- Direct sync to Shopify & WooCommerce stores  
- Background processing queue (Bull + Redis) for scraping & AI jobs  
- Centralized error handling & toast notifications  
- WCAG 2.1 AA accessibility compliance  
- Subscription-based access control (Stripe)  

---

## Architecture Overview

### Frontend

- Next.js 14+ (React + SSR)  
- TypeScript, Tailwind CSS, Shadcn/ui  
- React Hook Form + Zod for form validation  
- NextAuth.js for authentication  

### Backend

- Next.js API Routes (or Express.js)  
- Node.js, Prisma ORM (PostgreSQL)  
- Bull Queue + Redis for background jobs  
- Multer for image uploads  
- Cheerio + Puppeteer for web scraping  

### Database & Caching

- PostgreSQL: product schemas, full-text search  
- Redis: session store, caching, rate-limit data  

### AI Integrations

- OpenAI GPT-4  
- Anthropic Claude  
- Straico API  
- OpenRouter model routing  

### E-commerce APIs

- Shopify Admin API  
- WooCommerce REST API  

### Image Storage

- Cloudinary or AWS S3  

### Monitoring & Security

- Helmet.js, express-rate-limit  
- Winston logging  
- Sentry error tracking  

---

## Getting Started

### Prerequisites

- Node.js v18+  
- Yarn or npm  
- PostgreSQL database  
- Redis instance  
- Accounts & API keys for:  
  - OpenAI, Anthropic, Straico, OpenRouter  
  - Shopify & WooCommerce  
  - Cloudinary or S3  
  - Stripe  

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/ai-page-builder.git
cd ai-page-builder

# Install dependencies
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file at the project root with:

```
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Redis
REDIS_URL=redis://USER:PASSWORD@HOST:PORT

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# AI Providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
STRAICO_API_KEY=your-straico-key
OPENROUTER_API_KEY=your-openrouter-key

# E-commerce
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
WOOCOMMERCE_CONSUMER_KEY=...
WOOCOMMERCE_CONSUMER_SECRET=...

# Cloudinary or S3
CLOUDINARY_URL=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...

# Stripe
STRIPE_SECRET_KEY=...
```

---

## Usage

### Development

```bash
# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to explore the dashboard.

### Production Build

```bash
npm run build
npm start
```

---

## Directory Structure

```
/ai-page-builder
??? app/                   # Next.js 14+ app directory
?   ??? api/               # API Routes (scrape, ai, products, sync, webhooks)
?   ??? dashboard/         # Protected UI pages
?   ??? auth/              # Sign-in/up pages
?   ??? layout.tsx         # Root layout & providers
??? components/            # Reusable UI components
?   ??? ui/                # Base UI primitives
?   ??? forms/             # ScrapeForm, ProductForm
?   ??? editors/           # Rich text / HTML editors
?   ??? previews/          # ProductPreview, PreviewToggle
??? lib/                   # Business logic utilities
?   ??? ai/                # AI orchestration
?   ??? scraping/          # Puppeteer & Cheerio wrappers
?   ??? ecommerce/         # Shopify & WooCommerce sync
?   ??? copywriting/       # Copy framework templates
?   ??? seo/               # Keyword & meta tools
??? prisma/                # ORM schema & migrations
??? public/                # Static assets
??? types/                 # TypeScript interfaces & types
??? queueprocessor.ts      # Bull + Redis job setup
```

---

## Component List

| Component              | File              | Purpose                                                             |
|------------------------|-------------------|---------------------------------------------------------------------|
| AuthProvider           | `authprovider.tsx`| Provides NextAuth session context                                   |
| ScrapeForm             | `scrapeform.tsx`  | URL input + validation; dispatches scraping job                     |
| ProductForm            | `productform.tsx` | Manual product detail entry + image upload                          |
| CopyGenerator          | `copygenerator.tsx`| AI provider selector, framework recommendation & copy generation    |
| ProductPreview         | `productpreview.tsx`| Live mobile/desktop preview of generated page                      |
| SyncButton             | `syncbutton.tsx`  | Sync finalized product to Shopify or WooCommerce                    |
| QueueProcessor         | `queueprocessor.ts`| Background job processor (scrape & AI) using Bull + Redis          |
| PrismaClient           | `prismaclient.ts` | Exports configured Prisma client for DB operations                  |
| FrameworkSelector      | `frameworkselector.tsx`| Suggest & select high-converting copywriting frameworks       |
| PreviewToggle          | `previewtoggle.tsx`| Switch between mobile & desktop preview views                      |
| ExportButton           | `exportbutton.tsx`| Export clean HTML with inline CSS & optimized assets                |
| ErrorBoundary          | `errorboundary.tsx`| Catches UI errors & displays fallback                              |
| NotificationToast      | `notificationtoast.tsx`| Displays success, error, info toasts                          |
| Header                 | `header.tsx`       | Top navigation bar (logo, user menu, subscription status)           |
| Sidebar                | `sidebar.tsx`      | Collapsible side nav for dashboard sections                         |
| DashboardCard          | `dashboardcard.tsx`| Displays project cards with stats & quick actions                  |

---

## Dependencies

- Next.js 14+, React, TypeScript  
- Tailwind CSS, Shadcn/ui  
- React Hook Form, Zod  
- Prisma, PostgreSQL  
- Bull, Redis  
- Puppeteer, Cheerio  
- OpenAI, Anthropic, Straico, OpenRouter  
- Shopify & WooCommerce SDKs  
- Cloudinary or AWS SDK  
- NextAuth.js, Stripe  
- Helmet.js, express-rate-limit, Winston, Sentry  

---

## Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate"
  }
}
```

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feat/my-feature`)  
3. Commit changes (`git commit -m "feat: add new component"`)  
4. Push to your branch (`git push origin feat/my-feature`)  
5. Open a Pull Request  

Please follow our code style and write tests for new features.

---

## License

MIT ? Your Organization Name

---

Thank you for using **ai-page-builder**! If you encounter any issues or have feature requests, please open an issue on GitHub.