import React, { useState, ChangeEvent, FormEvent } from 'react'

interface ProductData {
  title: string
  description: string
  price: string
  images: string[]
}

interface FormErrors {
  title?: string
  description?: string
  price?: string
  images?: string
}

interface ProductFormProps {
  initialValues?: Partial<ProductData>
  onSubmit: (data: ProductData) => void
}

// Mock upload function - replace with actual implementation
const uploadImages = async (files: File[]): Promise<string[]> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Return mock URLs - replace with actual upload logic
  return files.map((file, index) => `https://example.com/image-${Date.now()}-${index}.jpg`)
}

const ProductForm: React.FC<ProductFormProps> = ({ initialValues = {}, onSubmit }) => {
  const [formData, setFormData] = useState<ProductData>({
    title: initialValues.title || '',
    description: initialValues.description || '',
    price: initialValues.price != null ? initialValues.price.toString() : '',
    images: initialValues.images || []
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)
    setErrors(prev => ({ ...prev, images: undefined }))
    try {
      const uploadedUrls = await uploadImages(Array.from(files))
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
    } catch {
      setErrors(prev => ({ ...prev, images: 'Failed to upload images.' }))
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = (data: ProductData): FormErrors => {
    const errs: FormErrors = {}
    if (!data.title.trim() || data.title.trim().length < 3) {
      errs.title = 'Title is required (min 3 characters).'
    }
    if (!data.description.trim() || data.description.trim().length < 10) {
      errs.description = 'Description is required (min 10 characters).'
    }
    const priceNumber = parseFloat(data.price)
    if (data.price === '' || isNaN(priceNumber) || priceNumber <= 0) {
      errs.price = 'Price must be a positive number.'
    }
    if (data.images.length === 0) {
      errs.images = 'At least one image is required.'
    }
    return errs
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
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        images: formData.images
      })
    } catch {
      setSubmitError('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const form = new FormData()
    files.forEach(file => form.append('images', file))
    const response = await axios.post('/api/upload', form)
    if (response.status !== 200 || !Array.isArray(response.data.urls)) {
      throw new Error('Upload failed')
    }
    return response.data.urls
  }

  const removeImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url)
    }))
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title" className="form-label">Product Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className="form-input"
          placeholder="Enter product title"
        />
        {errors.title && <div className="form-error">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className="form-textarea"
          placeholder="Describe your product in detail"
        />
        {errors.description && <div className="form-error">{errors.description}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="price" className="form-label">Price ($) *</label>
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
        />
        {errors.price && <div className="form-error">{errors.price}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="images" className="form-label">Product Images *</label>
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
          <div style={{ marginTop: '10px', color: '#007bff' }}>
            <span className="loading-spinner"></span> Uploading images...
          </div>
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

      {submitError && <div className="error">{submitError}</div>}

      <button type="submit" disabled={isSubmitting || isUploading} className="form-button">
        {isSubmitting ? 'Submitting...' : 'Save Product'}
      </button>
    </form>
  )
}

export default ProductForm