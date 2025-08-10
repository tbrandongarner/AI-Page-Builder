const mobileContainerStyle = {
  width: 360,
  border: '1px solid #ccc',
  borderRadius: 20,
  padding: 16,
  overflowY: 'auto' as const,
  backgroundColor: '#fff',
}
const imageStyleMobile = { width: '100%', borderRadius: 12 }
const titleStyleMobile = { fontSize: 20, margin: '12px 0' }
const priceStyleMobile = { fontSize: 18, fontWeight: 'bold' as const, margin: '8px 0' }
const descStyleMobile = { fontSize: 14, color: '#555' }
const featuresListStyleMobile = { paddingLeft: 20, margin: '8px 0' }
const testimonialFooterStyleMobile = { textAlign: 'right' as const, fontSize: 12, marginTop: 4 }

const desktopContainerStyle = {
  display: 'flex' as const,
  maxWidth: 1200,
  margin: '0 auto',
  padding: 20,
  backgroundColor: '#fff',
  border: '1px solid #eee',
  borderRadius: 8,
}
const imageSectionDesktop = { flex: '1 1 50%', paddingRight: 20 }
const imageStyleDesktop = { width: '100%', borderRadius: 8 }
const titleStyleDesktop = { fontSize: 28, margin: '0 0 16px' }
const priceStyleDesktop = { fontSize: 24, fontWeight: 'bold' as const, margin: '0 0 16px' }
const descStyleDesktop = { fontSize: 16, color: '#555', marginBottom: 16 }
const featuresListStyleDesktop = { marginBottom: 16 }
const featureItemStyleDesktop = { marginBottom: 8 }
const testimonialBlockquote = { fontStyle: 'italic' as const, margin: 0 }
const testimonialFigcaptionStyleDesktop = { textAlign: 'right' as const, fontSize: 14, marginTop: 4 }

const EditableText: FC<{
  section: string
  text: string
  className?: string
  onEdit: (section: string, value: string) => void
}> = ({ section, text, className, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setValue(text)
  }, [text])

  const startEditing = () => {
    setIsEditing(true)
  }

  const finishEditing = () => {
    if (value !== text) {
      onEdit(section, value)
    }
    setIsEditing(false)
  }

  const cancelEditing = () => {
    setValue(text)
    setIsEditing(false)
  }

  const handleSpanKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      startEditing()
    }
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finishEditing()
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return isEditing ? (
    <input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onBlur={finishEditing}
      onKeyDown={handleInputKeyDown}
      className={className}
      style={{ fontSize: 'inherit', fontFamily: 'inherit', width: '100%' }}
    />
  ) : (
    <span
      role="button"
      tabIndex={0}
      onDoubleClick={startEditing}
      onKeyDown={handleSpanKeyDown}
      className={className}
      aria-label={`Edit ${section}`}
    >
      {text}
    </span>
  )
}

const ProductPreview: FC<ProductPreviewProps> = ({ product, deviceType, onEdit }) => {
  const renderMobilePreview = () => (
    <div className="mobile-preview" style={mobileContainerStyle}>
      <img src={product.images[0]} alt={product.title} style={imageStyleMobile} />
      <h1 style={titleStyleMobile}>
        <EditableText section="title" text={product.title} className="product-title" onEdit={onEdit} />
      </h1>
      <p style={priceStyleMobile}>
        <EditableText section="price" text={product.price} className="product-price" onEdit={onEdit} />
      </p>
      <p style={descStyleMobile}>
        <EditableText section="description" text={product.description} className="product-description" onEdit={onEdit} />
      </p>
      {product.features.length > 0 && (
        <ul style={featuresListStyleMobile}>
          {product.features.map((feat) => (
            <li key={feat}>
              <EditableText section={`features.${feat}`} text={feat} className="product-feature" onEdit={onEdit} />
            </li>
          ))}
        </ul>
      )}
      {product.testimonials && product.testimonials.length > 0 && (
        <div className="testimonials" style={{ margin: '12px 0' }}>
          {product.testimonials.map((tst) => {
            const key = `${tst.quote}-${tst.author}`
            return (
              <blockquote key={key} style={testimonialBlockquote}>
                <EditableText
                  section={`testimonials.quote.${key}`}
                  text={tst.quote}
                  className="testimonial-quote"
                  onEdit={onEdit}
                />
                <footer style={testimonialFooterStyleMobile}>
                  ?{' '}
                  <EditableText
                    section={`testimonials.author.${key}`}
                    text={tst.author}
                    className="testimonial-author"
                    onEdit={onEdit}
                  />
                </footer>
              </blockquote>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderDesktopPreview = () => (
    <div className="desktop-preview" style={desktopContainerStyle}>
      <div className="image-section" style={imageSectionDesktop}>
        <img src={product.images[0]} alt={product.title} style={imageStyleDesktop} />
      </div>
      <div className="info-section" style={{ flex: '1 1 50%' }}>
        <h1 style={titleStyleDesktop}>
          <EditableText section="title" text={product.title} className="product-title" onEdit={onEdit} />
        </h1>
        <p style={priceStyleDesktop}>
          <EditableText section="price" text={product.price} className="product-price" onEdit={onEdit} />
        </p>
        <p style={descStyleDesktop}>
          <EditableText section="description" text={product.description} className="product-description" onEdit={onEdit} />
        </p>
        {product.features.length > 0 && (
          <ul style={featuresListStyleDesktop}>
            {product.features.map((feat) => (
              <li key={feat} style={featureItemStyleDesktop}>
                <EditableText section={`features.${feat}`} text={feat} className="product-feature" onEdit={onEdit} />
              </li>
            ))}
          </ul>
        )}
        {product.testimonials && product.testimonials.length > 0 && (
          <div className="testimonials">
            {product.testimonials.map((tst) => {
              const key = `${tst.quote}-${tst.author}`
              return (
                <figure key={key} style={{ marginBottom: 16 }}>
                  <blockquote style={testimonialBlockquote}>
                    <EditableText
                      section={`testimonials.quote.${key}`}
                      text={tst.quote}
                      className="testimonial-quote"
                      onEdit={onEdit}
                    />
                  </blockquote>
                  <figcaption style={testimonialFigcaptionStyleDesktop}>
                    ?{' '}
                    <EditableText
                      section={`testimonials.author.${key}`}
                      text={tst.author}
                      className="testimonial-author"
                      onEdit={onEdit}
                    />
                  </figcaption>
                </figure>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return deviceType === 'mobile' ? renderMobilePreview() : renderDesktopPreview()
}

export default ProductPreview