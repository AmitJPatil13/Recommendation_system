import React, { useEffect, useState } from 'react';
import { products as localProducts } from './data/products';
import { getProductRecommendations } from './services/aiService';
// import { fetchLiveProducts } from './services/productService';
import ProductCard from './components/ProductCard';
import { parseUserPreference } from './services/aiService';
import RecommendationInput from './components/RecommendationInput';
import './App.css';

function App() {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [reasonsById, setReasonsById] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastPreference, setLastPreference] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [useLiveData, setUseLiveData] = useState(false);
  const [allProducts, setAllProducts] = useState(localProducts);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      // Always use local products
      setAllProducts(localProducts);
      setIsFetchingProducts(false);
      setFetchError('');
    }
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [useLiveData]);

  const handleGetRecommendations = async (preference) => {
    setIsLoading(true);
    setLastPreference(preference);
    setShowAllProducts(false);
    
    try {
      const { items, source, reasonsById: reasons } = await getProductRecommendations(preference, allProducts);
      setRecommendedProducts(items);
      setReasonsById(reasons || {});
      if (source !== 'ai') {
        console.warn('AI not used. Source:', source);
      }
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

  const displayProducts = showAllProducts ? allProducts : recommendedProducts;
  const hasRecommendations = recommendedProducts.length > 0;
  const [sortBy, setSortBy] = useState('relevance');

  const sortedDisplay = (() => {
    const list = showAllProducts ? allProducts : recommendedProducts;
    if (sortBy === 'price-asc') return [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === 'price-desc') return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === 'rating') return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list; // relevance (default order)
  })();
  const highlightTerms = parseUserPreference(lastPreference).terms;

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
          isProductsLoading={false}
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
                : `All Products (${allProducts.length} items)`
              }
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ color: '#475569' }}>Sort by:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="preference-input"
                style={{ maxWidth: 220 }}
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            
            <div className="products-grid">
              {sortedDisplay.map(product => (
                <ProductCard key={product.id} product={product} highlightTerms={highlightTerms} reasons={reasonsById[product.id] || []} />
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
      </footer>
    </div>
  );
}

export default App;
