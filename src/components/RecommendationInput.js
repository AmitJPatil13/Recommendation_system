import React, { useState } from 'react';

const RecommendationInput = ({ onGetRecommendations, isLoading, isProductsLoading }) => {
  const [preference, setPreference] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = preference.trim();
    if (query) onGetRecommendations(query);
  };

  return (
    <div className="recommendation-input">
      <h2>AI Product Recommendations</h2>
      <p>Type your request in natural language. We’ll find the best matches.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            placeholder="e.g., phone under $500, vegan protein powder, running shoes for flat feet"
            className="preference-input"
            disabled={isLoading || isProductsLoading}
          />
          <button 
            type="submit" 
            className="recommend-btn"
            disabled={isLoading || isProductsLoading || !preference.trim()}
          >
            {isProductsLoading ? 'Loading Products...' : (isLoading ? 'Getting Recommendations...' : 'Get Recommendations')}
          </button>
        </div>
      </form>
      
      <div className="example-preferences">
        <h4>Examples:</h4>
        <ul>
          <li>"I want a phone under $500"</li>
          <li>"Wireless headphones with noise cancellation"</li>
          <li>"Vegan protein powder with good reviews"</li>
          <li>"Running shoes for flat feet"</li>
          <li>"Laptop for programming under $1000"</li>
        </ul>
      </div>
    </div>
  );
};

export default RecommendationInput;
