// Product service to fetch live products from DummyJSON and normalize shape

const DUMMY_JSON_URL = 'https://dummyjson.com/products?limit=100&select=title,price,brand,category,rating,tags,description,thumbnail,images';

// Normalize DummyJSON product into our app's product structure
function normalizeProduct(p) {
	return {
		id: p.id,
		name: p.title,
		category: capitalizeFirstLetter(p.category || 'Other'),
		price: Number(p.price) || 0,
		brand: p.brand || 'Generic',
		features: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags.slice(0, 6) : deriveFeaturesFromDescription(p.description),
		rating: typeof p.rating === 'number' ? p.rating : 4.0,
		description: p.description || `${p.title} in category ${p.category}`,
		imageUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.thumbnail || ''),
		externalLinks: buildExternalLinks(p.title, p.brand)
	};
}

function capitalizeFirstLetter(str) {
	if (!str || typeof str !== 'string') return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function deriveFeaturesFromDescription(description) {
	if (!description) return ['Good value', 'Popular choice'];
	const tokens = description
		.split(/[.,;\-]/)
		.map(s => s.trim())
		.filter(Boolean)
		.slice(0, 6);
	return tokens.length > 0 ? tokens : ['Good value', 'Popular choice'];
}

export async function fetchLiveProducts() {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 8000);
	try {
		const res = await fetch(DUMMY_JSON_URL, { signal: controller.signal });
		if (!res.ok) {
			throw new Error(`Failed to fetch products: ${res.status}`);
		}
		const data = await res.json();
		const list = Array.isArray(data.products) ? data.products : [];
		return list.map(normalizeProduct);
	} catch (err) {
		console.error('fetchLiveProducts error:', err);
		throw err;
	} finally {
		clearTimeout(timeoutId);
	}
}

function buildExternalLinks(title, brand) {
	const query = encodeURIComponent([brand, title].filter(Boolean).join(' ').trim());
	return {
		amazon: `https://www.amazon.in/s?k=${query}`,
		flipkart: `https://www.flipkart.com/search?q=${query}`,
		google: `https://www.google.com/search?tbm=shop&q=${query}`
	};
}
