import React from 'react';

const ProductCard = ({ product, highlightTerms = [], reasons = [] }) => {
  const highlight = (text) => {
    if (!text) return '';
    if (!highlightTerms || highlightTerms.length === 0) return text;
    const pattern = new RegExp(`(${highlightTerms.map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'ig');
    return String(text).split(pattern).map((part, i) => (
      pattern.test(part) ? <mark key={i} style={{ backgroundColor: '#fef08a', padding: '0 2px' }}>{part}</mark> : part
    ));
  };
  return (
    <div className="product-card">
      {product.imageUrl && (
        <div style={{ marginBottom: '0.75rem' }}>
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
        </div>
      )}
      <div className="product-header">
        <h3 className="product-name">{highlight(product.name)}</h3>
        <span className="product-brand">{product.brand}</span>
      </div>
      
      <div className="product-details">
        <div className="product-price">${product.price}</div>
        <div className="product-category">{product.category}</div>
        <div className="product-rating">
          ⭐ {product.rating}/5
        </div>
      </div>
      
      <div className="product-description">
        {highlight(product.description)}
      </div>
      
      <div className="product-features">
        <h4>Key Features:</h4>
        <ul>
          {product.features.map((feature, index) => (
            <li key={index}>{highlight(feature)}</li>
          ))}
        </ul>
      </div>

      {reasons && reasons.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <h4 style={{ marginBottom: '0.25rem' }}>Why this?</h4>
          <ul>
            {reasons.map((r, i) => (
              <li key={i} style={{ color: '#475569', fontSize: '0.9rem' }}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {product.externalLinks && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <a className="show-all-btn" href={product.externalLinks.amazon} target="_blank" rel="noopener noreferrer">Amazon</a>
          <a className="show-all-btn" href={product.externalLinks.flipkart} target="_blank" rel="noopener noreferrer">Flipkart</a>
          <a className="show-all-btn" href={product.externalLinks.google} target="_blank" rel="noopener noreferrer">Google Shopping</a>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
