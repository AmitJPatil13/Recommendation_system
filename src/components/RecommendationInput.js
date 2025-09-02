import React, { useState } from 'react';

const RecommendationInput = ({ onGetRecommendations, isLoading }) => {
  const [preference, setPreference] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (preference.trim()) {
      onGetRecommendations(preference.trim());
    }
  };

  return (
    <div className="recommendation-input">
      <h2>AI Product Recommendations</h2>
      <p>Tell us what you're looking for and our AI will recommend the best products for you!</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            placeholder="e.g., I want a phone under $500, or I need wireless headphones with noise cancellation"
            className="preference-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="recommend-btn"
            disabled={isLoading || !preference.trim()}
          >
            {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </button>
        </div>
      </form>
      
      <div className="example-preferences">
        <h4>Example preferences:</h4>
        <ul>
          <li>"I want a phone under $500"</li>
          <li>"I need wireless headphones with noise cancellation"</li>
          <li>"Show me Apple products"</li>
          <li>"I need a laptop for work"</li>
          <li>"Best rated tablets"</li>
        </ul>
      </div>
    </div>
  );
};

export default RecommendationInput;
