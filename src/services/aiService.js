// AI Service for product recommendations
// This service will use OpenAI API to provide intelligent product recommendations

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const getProductRecommendations = async (userPreference, products) => {
  try {
    // If no API key is provided, use a fallback recommendation system
    if (!OPENAI_API_KEY) {
      return getFallbackRecommendations(userPreference, products);
    }

    const productList = products.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: $${p.price}, Brand: ${p.brand}, Features: ${p.features.join(', ')}, Rating: ${p.rating}`
    ).join('\n');

    const prompt = `You are a product recommendation assistant. Based on the user's preference and the available products, recommend the best matching products.

User Preference: "${userPreference}"

Available Products:
${productList}

Please analyze the user's preference and recommend 3-5 products that best match their needs. Consider factors like price, category, features, and brand preferences.

Respond with ONLY a JSON array of product IDs that you recommend, in order of preference. Example: [3, 1, 7, 2]`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful product recommendation assistant. Always respond with valid JSON arrays of product IDs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendationText = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    const recommendedIds = JSON.parse(recommendationText);
    
    // Filter products based on recommended IDs
    const recommendedProducts = recommendedIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);

    return recommendedProducts;

  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // Fallback to local recommendation system
    return getFallbackRecommendations(userPreference, products);
  }
};

// Fallback recommendation system when OpenAI API is not available
const getFallbackRecommendations = (userPreference, products) => {
  const preference = userPreference.toLowerCase();
  let filteredProducts = [...products];

  // Price filtering
  const priceMatch = preference.match(/\$(\d+)/);
  if (priceMatch) {
    const maxPrice = parseInt(priceMatch[1]);
    filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
  }

  // Category filtering
  const categories = ['phone', 'smartphone', 'laptop', 'headphones', 'tablet'];
  const categoryMatch = categories.find(cat => preference.includes(cat));
  if (categoryMatch) {
    const categoryMap = {
      'phone': 'Smartphone',
      'smartphone': 'Smartphone',
      'laptop': 'Laptop',
      'headphones': 'Headphones',
      'tablet': 'Tablet'
    };
    filteredProducts = filteredProducts.filter(p => p.category === categoryMap[categoryMatch]);
  }

  // Brand filtering
  const brands = ['apple', 'samsung', 'google', 'oneplus', 'dell', 'sony'];
  const brandMatch = brands.find(brand => preference.includes(brand));
  if (brandMatch) {
    const brandMap = {
      'apple': 'Apple',
      'samsung': 'Samsung',
      'google': 'Google',
      'oneplus': 'OnePlus',
      'dell': 'Dell',
      'sony': 'Sony'
    };
    filteredProducts = filteredProducts.filter(p => p.brand === brandMap[brandMatch]);
  }

  // Feature filtering
  const features = ['5g', 'camera', 'wireless', 'noise cancelling', 'fast charging'];
  const featureMatch = features.find(feature => preference.includes(feature));
  if (featureMatch) {
    filteredProducts = filteredProducts.filter(p => 
      p.features.some(f => f.toLowerCase().includes(featureMatch))
    );
  }

  // If no specific filters matched, return top-rated products
  if (filteredProducts.length === 0) {
    filteredProducts = products.sort((a, b) => b.rating - a.rating);
  }

  // Sort by rating and return top 5
  return filteredProducts
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
};
