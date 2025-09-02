// Simple test for the fallback recommendation system
import { getProductRecommendations } from '../aiService';

// Mock products for testing
const mockProducts = [
  {
    id: 1,
    name: "iPhone 13",
    category: "Smartphone",
    price: 699,
    brand: "Apple",
    features: ["5G", "A15 Bionic", "12MP Camera"],
    rating: 4.5
  },
  {
    id: 2,
    name: "Samsung Galaxy S21",
    category: "Smartphone", 
    price: 599,
    brand: "Samsung",
    features: ["5G", "Snapdragon 888", "64MP Camera"],
    rating: 4.3
  },
  {
    id: 3,
    name: "MacBook Air M2",
    category: "Laptop",
    price: 1199,
    brand: "Apple",
    features: ["M2 Chip", "13-inch", "8GB RAM"],
    rating: 4.7
  }
];

// Test function (can be run in browser console)
export const testRecommendations = async () => {
  console.log('Testing AI Recommendation System...');
  
  // Test 1: Price filtering
  console.log('\n1. Testing price filter: "phone under $600"');
  const priceResults = await getProductRecommendations("phone under $600", mockProducts);
  console.log('Results:', priceResults.map(p => `${p.name} - $${p.price}`));
  
  // Test 2: Brand filtering
  console.log('\n2. Testing brand filter: "Apple products"');
  const brandResults = await getProductRecommendations("Apple products", mockProducts);
  console.log('Results:', brandResults.map(p => `${p.name} - ${p.brand}`));
  
  // Test 3: Category filtering
  console.log('\n3. Testing category filter: "laptop"');
  const categoryResults = await getProductRecommendations("laptop", mockProducts);
  console.log('Results:', categoryResults.map(p => `${p.name} - ${p.category}`));
  
  console.log('\n✅ All tests completed!');
};

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testRecommendations = testRecommendations;
}
