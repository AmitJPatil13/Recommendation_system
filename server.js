// Minimal Node proxy for OpenAI (no external deps)
// Usage: set OPENAI_API_KEY in environment. Run: npm run server

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
	console.warn('[proxy] Warning: OPENAI_API_KEY not set; requests will fail.');
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		let body = '';
		req.on('data', chunk => (body += chunk));
		req.on('end', () => resolve(body));
		req.on('error', reject);
	});
}

const server = http.createServer(async (req, res) => {
	// CORS
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	if (req.method === 'OPTIONS') {
		res.writeHead(204);
		return res.end();
	}

	if (req.method !== 'POST' || req.url !== '/api/ai') {
		res.writeHead(404, { 'Content-Type': 'application/json' });
		return res.end(JSON.stringify({ error: 'Not found' }));
	}

	try {
		const body = await readBody(req);
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${OPENAI_API_KEY}`
			}
		};
		const upstream = https.request(OPENAI_URL, options, up => {
			let data = '';
			up.on('data', d => (data += d));
			up.on('end', () => {
				res.writeHead(up.statusCode || 500, { 'Content-Type': 'application/json' });
				res.end(data);
			});
		});
		upstream.on('error', err => {
			res.writeHead(502, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: 'upstream_error', message: String(err.message || err) }));
		});
		upstream.write(body || '{}');
		upstream.end();
	} catch (err) {
		res.writeHead(500, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'proxy_error', message: String(err.message || err) }));
	}
});

server.listen(PORT, () => {
	console.log(`[proxy] listening on http://localhost:${PORT}`);
});
