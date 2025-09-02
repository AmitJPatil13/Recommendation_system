import React, { useState } from 'react';
import { products } from './data/products';
import { getProductRecommendations } from './services/aiService';
import ProductCard from './components/ProductCard';
import RecommendationInput from './components/RecommendationInput';
import './App.css';

function App() {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPreference, setLastPreference] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(true);

  const handleGetRecommendations = async (preference) => {
    setIsLoading(true);
    setLastPreference(preference);
    setShowAllProducts(false);
    
    try {
      const recommendations = await getProductRecommendations(preference, products);
      setRecommendedProducts(recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Sorry, there was an error getting recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAllProducts = () => {
    setShowAllProducts(true);
    setRecommendedProducts([]);
    setLastPreference('');
  };

  const displayProducts = showAllProducts ? products : recommendedProducts;
  const hasRecommendations = recommendedProducts.length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛍️ AI Product Recommendation System</h1>
        <p>Discover the perfect products with AI-powered recommendations</p>
      </header>

      <main className="app-main">
        <RecommendationInput 
          onGetRecommendations={handleGetRecommendations}
          isLoading={isLoading}
        />

        {hasRecommendations && (
          <div className="recommendations-header">
            <h2>Recommended Products for: "{lastPreference}"</h2>
            <button 
              onClick={handleShowAllProducts}
              className="show-all-btn"
            >
              Show All Products
            </button>
          </div>
        )}

        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>AI is analyzing your preferences...</p>
          </div>
        )}

        {!isLoading && (
          <div className="products-section">
            <h2>
              {hasRecommendations 
                ? `Found ${recommendedProducts.length} recommendations` 
                : `All Products (${products.length} items)`
              }
            </h2>
            
            <div className="products-grid">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {displayProducts.length === 0 && !isLoading && (
              <div className="no-results">
                <p>No products found matching your criteria. Try adjusting your preferences.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by AI • Built with React</p>
        <p className="api-note">
          Note: To use OpenAI API, add your API key to the .env file as REACT_APP_OPENAI_API_KEY
        </p>
      </footer>
    </div>
  );
}

export default App;
