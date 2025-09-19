export type ToneSetting =
  | 'balanced'
  | 'conversational'
  | 'professional'
  | 'bold'
  | 'luxury'
  | 'playful'
  | 'technical'
  | 'inspirational'

export interface ProductMedia {
  url: string
  alt?: string
}

export interface ProductReview {
  author: string
  quote: string
}

export interface ProductInput {
  title: string
  description: string
  price: number
  images: string[]
  targetAudience?: string
  primaryKeyword?: string
  secondaryKeyword?: string
  tone?: ToneSetting
  keyBenefits?: string[]
  features?: string[]
  useCases?: string[]
  whatsIncluded?: string[]
  reviews?: ProductReview[]
}

export type MarketingFramework = 'AIDA' | 'PAS' | 'BAB' | 'FAB' | '4Ps'

export type BlockType =
  | 'hook'
  | 'features'
  | 'benefits'
  | 'specs'
  | 'use_cases'
  | 'whats_included'
  | 'social_proof'
  | 'cta'
  | 'summary'

export interface GeneratedBlock {
  id: string
  type: BlockType
  title: string
  headline: string
  body: string
  bullets?: string[]
  callToAction?: {
    label: string
    url?: string
    description?: string
  }
}

export interface GeneratedCopyResult {
  framework: MarketingFramework
  headline: string
  subheadline: string
  synopsis: string
  blocks: GeneratedBlock[]
  html: string
}
