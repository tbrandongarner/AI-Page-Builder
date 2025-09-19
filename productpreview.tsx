import React from 'react'
import type { ProductInput } from './types'

export type PreviewDevice = 'mobile' | 'desktop'

export interface ProductPreviewProps {
  product: ProductInput
  deviceType?: PreviewDevice
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ product, deviceType = 'desktop' }) => {
  const containerClass = deviceType === 'mobile' ? 'preview-mobile' : 'preview-desktop'
  const primaryImage = product.images[0]

  return (
    <div className={`product-preview ${containerClass}`}>
      {primaryImage && (
        <div className="product-preview__image">
          <img src={primaryImage} alt={product.title} />
        </div>
      )}
      <div className="product-preview__content">
        <h2>{product.title}</h2>
        <p className="product-preview__price">${product.price.toFixed(2)}</p>
        <p className="product-preview__description">{product.description}</p>
        {product.features && product.features.length > 0 && (
          <section>
            <h3>Key features</h3>
            <ul>
              {product.features.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>
        )}
        {product.keyBenefits && product.keyBenefits.length > 0 && (
          <section>
            <h3>Benefits</h3>
            <ul>
              {product.keyBenefits.map(benefit => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </section>
        )}
        {product.useCases && product.useCases.length > 0 && (
          <section>
            <h3>Use cases</h3>
            <ul>
              {product.useCases.map(useCase => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductPreview
