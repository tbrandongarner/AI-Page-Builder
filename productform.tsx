import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import type { ProductInput, ToneSetting } from './types'

interface ProductFormValues {
  title: string
  description: string
  price: string
  images: string[]
  targetAudience: string
  primaryKeyword: string
  secondaryKeyword: string
  tone: ToneSetting
  keyBenefits: string
  features: string
  useCases: string
  whatsIncluded: string
}

interface FormErrors {
  title?: string
  description?: string
  price?: string
  images?: string
}

interface ProductFormProps {
  initialValues?: Partial<ProductInput>
  onSubmit: (data: ProductInput) => void | Promise<void>
}

const defaultTone: ToneSetting = 'balanced'

function parseList(value: string): string[] {
  return value
    .split(/\r?\n|[,;]+/)
    .map(item => item.trim())
    .filter(Boolean)
}

const ProductForm: React.FC<ProductFormProps> = ({ initialValues, onSubmit }) => {
  const [formData, setFormData] = useState<ProductFormValues>(() => ({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    price: initialValues?.price != null ? initialValues.price.toString() : '',
    images: initialValues?.images ?? [],
    targetAudience: initialValues?.targetAudience ?? '',
    primaryKeyword: initialValues?.primaryKeyword ?? '',
    secondaryKeyword: initialValues?.secondaryKeyword ?? '',
    tone: initialValues?.tone ?? defaultTone,
    keyBenefits: (initialValues?.keyBenefits ?? []).join('\n'),
    features: (initialValues?.features ?? []).join('\n'),
    useCases: (initialValues?.useCases ?? []).join('\n'),
    whatsIncluded: (initialValues?.whatsIncluded ?? []).join('\n'),
  }))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!initialValues) return
    setFormData(prev => ({
      ...prev,
      title: initialValues.title ?? prev.title,
      description: initialValues.description ?? prev.description,
      price: initialValues.price != null ? initialValues.price.toString() : prev.price,
      images: initialValues.images ?? prev.images,
      targetAudience: initialValues.targetAudience ?? prev.targetAudience,
      primaryKeyword: initialValues.primaryKeyword ?? prev.primaryKeyword,
      secondaryKeyword: initialValues.secondaryKeyword ?? prev.secondaryKeyword,
      tone: initialValues.tone ?? prev.tone,
      keyBenefits:
        initialValues.keyBenefits != null
          ? initialValues.keyBenefits.join('\n')
          : prev.keyBenefits,
      features:
        initialValues.features != null ? initialValues.features.join('\n') : prev.features,
      useCases:
        initialValues.useCases != null ? initialValues.useCases.join('\n') : prev.useCases,
      whatsIncluded:
        initialValues.whatsIncluded != null
          ? initialValues.whatsIncluded.join('\n')
          : prev.whatsIncluded,
    }))
  }, [initialValues])

  const hasOptionalContent = useMemo(() => {
    return [
      formData.targetAudience,
      formData.primaryKeyword,
      formData.secondaryKeyword,
      formData.keyBenefits,
      formData.features,
      formData.useCases,
      formData.whatsIncluded,
    ].some(Boolean)
  }, [formData])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const convertFilesToDataUrls = async (files: FileList): Promise<string[]> => {
    const converters = Array.from(files).map(
      file =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve(typeof reader.result === 'string' ? reader.result : '')
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        }),
    )

    const urls = await Promise.all(converters)
    return urls.filter(Boolean)
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setErrors(prev => ({ ...prev, images: undefined }))
    try {
      const uploadedUrls = await convertFilesToDataUrls(files)
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
    } catch {
      setErrors(prev => ({ ...prev, images: 'Failed to read selected images.' }))
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = (data: ProductFormValues): FormErrors => {
    const validationErrors: FormErrors = {}
    if (!data.title.trim() || data.title.trim().length < 3) {
      validationErrors.title = 'Title is required (min 3 characters).'
    }
    if (!data.description.trim() || data.description.trim().length < 10) {
      validationErrors.description = 'Description is required (min 10 characters).'
    }
    const priceNumber = parseFloat(data.price)
    if (data.price === '' || Number.isNaN(priceNumber) || priceNumber <= 0) {
      validationErrors.price = 'Price must be a positive number.'
    }
    if (data.images.length === 0) {
      validationErrors.images = 'At least one image is required.'
    }
    return validationErrors
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const payload: ProductInput = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        images: formData.images,
        targetAudience: formData.targetAudience.trim() || undefined,
        primaryKeyword: formData.primaryKeyword.trim() || undefined,
        secondaryKeyword: formData.secondaryKeyword.trim() || undefined,
        tone: formData.tone,
        keyBenefits: parseList(formData.keyBenefits),
        features: parseList(formData.features),
        useCases: parseList(formData.useCases),
        whatsIncluded: parseList(formData.whatsIncluded),
      }

      await onSubmit(payload)
    } catch (error) {
      console.error('Failed to submit product form', error)
      setSubmitError('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url),
    }))
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Product Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="form-input"
              placeholder="Enter product title"
              required
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="form-textarea"
              placeholder="Describe your product in detail"
              rows={6}
              required
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Price ($) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              disabled={isSubmitting}
              step="0.01"
              min="0"
              className="form-input"
              placeholder="0.00"
              required
            />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="targetAudience" className="form-label">
              Target audience
            </label>
            <input
              id="targetAudience"
              name="targetAudience"
              type="text"
              value={formData.targetAudience}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="form-input"
              placeholder="e.g. Busy professionals, eco-conscious parents"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="primaryKeyword" className="form-label">
                Primary keyword
              </label>
              <input
                id="primaryKeyword"
                name="primaryKeyword"
                type="text"
                value={formData.primaryKeyword}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="form-input"
                placeholder="Main SEO keyword"
              />
            </div>
            <div className="form-group">
              <label htmlFor="secondaryKeyword" className="form-label">
                Secondary keyword
              </label>
              <input
                id="secondaryKeyword"
                name="secondaryKeyword"
                type="text"
                value={formData.secondaryKeyword}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="form-input"
                placeholder="Optional supporting keyword"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tone" className="form-label">
              Preferred tone
            </label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="form-input"
            >
              <option value="balanced">Balanced</option>
              <option value="conversational">Conversational</option>
              <option value="professional">Professional</option>
              <option value="bold">Bold & energetic</option>
              <option value="luxury">Luxury & premium</option>
              <option value="playful">Playful & fun</option>
              <option value="technical">Technical & precise</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>
        </div>

        <div>
          <div className="form-group">
            <label htmlFor="images" className="form-label">
              Product images *
            </label>
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isUploading || isSubmitting}
              className="form-input"
            />
            {errors.images && <div className="form-error">{errors.images}</div>}
            {isUploading && (
              <div className="form-hint">Uploading images…</div>
            )}
            {formData.images.length > 0 && (
              <div className="image-preview">
                {formData.images.map(url => (
                  <div key={url} className="image-item">
                    <img src={url} alt="Product preview" />
                    <button type="button" onClick={() => removeImage(url)} disabled={isSubmitting}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="keyBenefits" className="form-label">
              Key benefits
            </label>
            <textarea
              id="keyBenefits"
              name="keyBenefits"
              value={formData.keyBenefits}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="form-textarea"
              placeholder="List benefits (one per line)"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="features" className="form-label">
              Product features
            </label>
            <textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="form-textarea"
              placeholder="List features (one per line)"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="useCases" className="form-label">
              Use cases
            </label>
            <textarea
              id="useCases"
              name="useCases"
              value={formData.useCases}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="form-textarea"
              placeholder="Where and how is the product used?"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="whatsIncluded" className="form-label">
              What&apos;s included
            </label>
            <textarea
              id="whatsIncluded"
              name="whatsIncluded"
              value={formData.whatsIncluded}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="form-textarea"
              placeholder="List box contents or service inclusions"
              rows={4}
            />
          </div>
        </div>
      </div>

      {hasOptionalContent ? (
        <div className="form-hint">
          Great! We&apos;ll use your benefits, features and keywords to tailor the generated copy.
        </div>
      ) : (
        <div className="form-hint">Add optional details to help the AI craft stronger copy.</div>
      )}

      {submitError && <div className="form-error">{submitError}</div>}

      <button type="submit" disabled={isSubmitting || isUploading} className="form-button">
        {isSubmitting ? 'Submitting…' : 'Save Product'}
      </button>
    </form>
  )
}

export default ProductForm
