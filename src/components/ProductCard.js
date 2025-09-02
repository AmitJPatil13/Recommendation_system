import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-header">
        <h3 className="product-name">{product.name}</h3>
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
        {product.description}
      </div>
      
      <div className="product-features">
        <h4>Key Features:</h4>
        <ul>
          {product.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductCard;
