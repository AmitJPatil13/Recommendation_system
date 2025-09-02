// AI Service for product recommendations
// This service will use OpenAI API to provide intelligent product recommendations

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = process.env.REACT_APP_USE_PROXY === 'true'
  ? (process.env.REACT_APP_PROXY_URL || 'http://localhost:8787/api/ai')
  : 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';

export const getProductRecommendations = async (userPreference, products) => {
  const intent = parseUserPreference(userPreference);
  try {
    // If no API key is provided, use a fallback recommendation system
    if (!OPENAI_API_KEY && process.env.REACT_APP_USE_PROXY !== 'true') {
      return { items: getFallbackRecommendations(userPreference, products), source: 'fallback' };
    }

    const allowedIds = products.map(p => p.id);
    // Semantic pre-ranking: shortlist top 20 most relevant to intent
    const shortlist = [...products]
      .map(p => ({ p, s: computeIntentScore(p, intent) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 20)
      .map(x => x.p);

    const productList = shortlist.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: $${p.price}, Brand: ${p.brand}, Features: ${p.features.join(', ')}, Rating: ${p.rating}`
    ).join('\n');

    const prompt = `You are a product recommendation assistant. Based on the user's preference and the available products, recommend ONLY items from the provided product list.

User Preference: "${userPreference}"

Available Products:
${productList}

Please analyze the user's preference and recommend 3-5 products that best match their needs. Consider price, category intent, features, brand preferences, and quality. If the user clearly asks for a category (e.g., phones), DO NOT include other categories.

Respond with ONLY a JSON array of product IDs you recommend, in order of preference. Example: [3, 1, 7, 2]
If no suitable matches exist, return an empty array []`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful product recommendation assistant. Always respond with valid JSON arrays of product IDs and never include any other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 120,
        temperature: 0.1,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim?.() || '';
    let recommendedIds = extractJsonIdArray(raw);
    // Strictly keep only known product IDs
    recommendedIds = recommendedIds.filter(id => allowedIds.includes(id));
    
    // Filter products based on recommended IDs
    let recommendedProducts = recommendedIds
      .map(id => shortlist.find(p => p.id === id) || products.find(p => p.id === id))
      .filter(Boolean);

    // Strict category enforcement when user specified a category
    if (intent.desiredCategories.length > 0) {
      const matchesRule = (cat) => intent.desiredCategories.some(r => r.match(String(cat || '').toLowerCase()));
      const strictlyFiltered = recommendedProducts.filter(p => matchesRule(p.category));
      if (strictlyFiltered.length > 0) {
        recommendedProducts = strictlyFiltered;
      } else {
        // If AI suggestions don't contain requested category, fallback to best from the whole pool by category
        const poolStrict = products.filter(p => matchesRule(p.category));
        recommendedProducts = poolStrict.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
      }
    }

    // If AI returned nothing valid, backfill with high-quality defaults matching intent
    if (!recommendedProducts || recommendedProducts.length === 0) {
      const fallbackItems = getFallbackRecommendations(userPreference, products);
      return { items: fallbackItems, source: 'ai_empty_fallback', reasonsById: buildReasonsMap(fallbackItems, intent) };
    }

    return { items: recommendedProducts, source: 'ai', reasonsById: buildReasonsMap(recommendedProducts, intent) };

  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // Fallback to local recommendation system
    const items = getFallbackRecommendations(userPreference, products);
    return { items, source: 'error_ai_fallback', errorMessage: String(error?.message || error), reasonsById: buildReasonsMap(items, parseUserPreference(userPreference)) };
  }
};

// Public: parse user preference into intent
export function parseUserPreference(userPreference) {
  const text = String(userPreference || '').toLowerCase();
  const terms = Array.from(new Set(
    text
      .replace(/[^a-z0-9\s$]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
  ));

  const directDollar = text.match(/\$(\d{2,6})/);
  const underMatch = text.match(/(?:under|below|less than|<=)\s*(\d{2,6})/);
  const maxPrice = directDollar ? parseInt(directDollar[1], 10) : (underMatch ? parseInt(underMatch[1], 10) : undefined);

  const desiredCategories = [];
  const categoryRules = [
    // Phones
    { words: ['phone', 'phones', 'smartphone', 'smartphones', 'mobile', 'mobiles'], match: (c) => c.includes('phone') || c.includes('mobile') },
    // Laptops
    { words: ['laptop', 'laptops', 'notebook', 'notebooks', 'ultrabook'], match: (c) => c.includes('laptop') || c.includes('notebook') },
    // Headphones / Earbuds
    { words: ['headphone', 'headphones', 'earbuds', 'earbud', 'earphone', 'earphones', 'buds'], match: (c) => c.includes('head') || c.includes('ear') },
    // Tablets
    { words: ['tablet', 'tablets', 'ipad', 'ipads'], match: (c) => c.includes('tablet') || c.includes('ipad') }
  ];
  for (const r of categoryRules) {
    if (r.words.some(w => text.includes(w))) desiredCategories.push(r);
  }

  const desiredBrands = ['apple', 'samsung', 'google', 'oneplus', 'dell', 'sony'].filter(b => text.includes(b));
  const desiredFeatures = ['5g', 'camera', 'wireless', 'noise cancelling', 'noise-cancelling', 'fast charging', 'bluetooth']
    .filter(f => text.includes(f));

  return { terms, maxPrice, desiredCategories, desiredBrands, desiredFeatures };
}

// Fallback recommendation system when OpenAI API is not available
const getFallbackRecommendations = (userPreference, products) => {
  const intent = parseUserPreference(userPreference);
  let pool = Array.isArray(products) ? products : [];

  // Strict category pre-filter if user specified one
  if (intent.desiredCategories.length > 0) {
    const matchesRule = (cat) => intent.desiredCategories.some(r => r.match(String(cat || '').toLowerCase()));
    const strictPool = pool.filter(p => matchesRule(p.category));
    if (strictPool.length > 0) {
      pool = strictPool;
    }
  }

  const scored = pool.map(p => {
    let score = 0;

    // Price score
    if (typeof intent.maxPrice === 'number') {
      const price = Number(p.price) || 0;
      if (price <= intent.maxPrice) {
        // Cheaper gets slightly more points when under budget
        const distance = Math.max(1, intent.maxPrice - price);
        score += 20 + Math.min(10, distance / 50);
      } else {
        score -= 15; // penalize over budget
      }
    }

    // Category match score
    if (intent.desiredCategories.length > 0) {
      const c = String(p.category || '').toLowerCase();
      if (intent.desiredCategories.some(r => r.match(c))) {
        score += 25;
      }
    }

    // Brand match score
    if (intent.desiredBrands.length > 0) {
      const brand = String(p.brand || '').toLowerCase();
      if (intent.desiredBrands.some(b => brand.includes(b))) {
        score += 15;
      }
    }

    // Feature match score
    if (intent.desiredFeatures.length > 0) {
      const features = Array.isArray(p.features) ? p.features.map(f => String(f).toLowerCase()) : [];
      const matches = intent.desiredFeatures.filter(f => features.some(ff => ff.includes(f)));
      score += Math.min(20, matches.length * 8);
    }

    // Rating weight
    const rating = typeof p.rating === 'number' ? p.rating : 0;
    score += rating * 3; // up to ~15

    // Small bump for keyword presence in name/description
    const blob = `${String(p.name || '')} ${String(p.description || '')}`.toLowerCase();
    const keywordMatches = intent.terms.filter(t => t.length >= 3 && blob.includes(t));
    score += Math.min(10, keywordMatches.length * 2);

    return { product: p, score };
  });

  // If nothing meaningful, default to rating sort
  if (scored.every(s => s.score === 0)) {
    return [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.product);
};

// Robustly extract a JSON array of IDs from model output
function extractJsonIdArray(text) {
  try {
    // If it's already a valid JSON array
    const direct = JSON.parse(text);
    if (Array.isArray(direct)) return direct.filter(Number.isFinite);
  } catch (_) {}
  // Find first JSON-looking array substring
  const match = text.match(/\[[\s\S]*?\]/);
  if (match) {
    try {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr)) return arr.filter(Number.isFinite);
    } catch (_) {}
  }
  // Fallback: parse number list like 1, 2, 3
  const nums = text.match(/\d+/g);
  if (nums) return nums.map(n => parseInt(n, 10)).filter(Number.isFinite);
  return [];
}

// Simple semantic/intent score for shortlist
function computeIntentScore(product, intent) {
  let score = 0;
  const nameDesc = `${String(product.name || '')} ${String(product.description || '')}`.toLowerCase();
  // keyword terms
  for (const t of intent.terms) {
    if (t.length >= 3 && nameDesc.includes(t)) score += 1.5;
  }
  // category
  if (intent.desiredCategories.length > 0) {
    const c = String(product.category || '').toLowerCase();
    if (intent.desiredCategories.some(r => r.match(c))) score += 3;
  }
  // brand
  if (intent.desiredBrands.length > 0) {
    const b = String(product.brand || '').toLowerCase();
    if (intent.desiredBrands.some(x => b.includes(x))) score += 2;
  }
  // features
  if (intent.desiredFeatures.length > 0) {
    const feats = (product.features || []).map(f => String(f).toLowerCase());
    const m = intent.desiredFeatures.filter(f => feats.some(ff => ff.includes(f))).length;
    score += Math.min(3, m);
  }
  // price budget closeness
  if (typeof intent.maxPrice === 'number') {
    const p = Number(product.price) || 0;
    if (p <= intent.maxPrice) score += 2 + Math.min(2, (intent.maxPrice - p) / 200);
  }
  // rating
  score += (Number(product.rating) || 0) / 2; // up to ~2.5
  return score;
}

function buildReasonsMap(items, intent) {
  const map = {};
  for (const item of items) {
    const reasons = [];
    if (typeof intent.maxPrice === 'number' && Number(item.price) <= intent.maxPrice) {
      reasons.push(`Under your budget ($${intent.maxPrice})`);
    }
    if (intent.desiredCategories.length > 0) {
      const c = String(item.category || '').toLowerCase();
      if (intent.desiredCategories.some(r => r.match(c))) reasons.push(`Matches requested category (${item.category})`);
    }
    if (intent.desiredBrands.length > 0) {
      const b = String(item.brand || '').toLowerCase();
      const m = intent.desiredBrands.find(x => b.includes(x));
      if (m) reasons.push(`Brand matches (${item.brand})`);
    }
    if (intent.desiredFeatures.length > 0) {
      const feats = (item.features || []).map(f => String(f).toLowerCase());
      const matched = intent.desiredFeatures.filter(f => feats.some(ff => ff.includes(f)));
      if (matched.length > 0) reasons.push(`Has features: ${matched.join(', ')}`);
    }
    if ((Number(item.rating) || 0) >= 4.3) reasons.push(`High rating (${item.rating}/5)`);
    const blob = `${String(item.name || '')} ${String(item.description || '')}`.toLowerCase();
    const k = intent.terms.filter(t => t.length >= 3 && blob.includes(t)).slice(0, 3);
    if (k.length > 0) reasons.push(`Relevant keywords: ${k.join(', ')}`);
    map[item.id] = reasons;
  }
  return map;
}
