# AI Product Recommendation System

A React-based product recommendation system that uses AI to provide intelligent product suggestions based on user preferences.

## Features

- 🛍️ **Product Catalog**: Browse through a curated list of tech products
- 🤖 **AI Recommendations**: Get personalized product suggestions using OpenAI's GPT
- 💡 **Smart Filtering**: Fallback recommendation system when AI API is unavailable
- 🧠 **Reasons shown**: Each recommendation explains “why this?” (budget, category, features, rating)
- ↕️ **Sorting**: Relevance, Price (asc/desc), Rating
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Fast Performance**: Minimal dependencies for optimal loading speed

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## AI Integration (Optional)

To use OpenAI's GPT for recommendations:

1. Create a `.env` file in the root directory
2. Add your OpenAI API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_api_key_here
   ```
3. Restart the development server

**Note**: The app works without an API key using a built-in fallback recommendation system.

### Using the built-in proxy (recommended)

Keep your key server-side while the frontend stays keyless.

1. Create a `.env`:
```
REACT_APP_USE_PROXY=true
REACT_APP_PROXY_URL=http://localhost:8787/api/ai
```
2. Set the server key in your shell (do NOT commit):
```
$env:OPENAI_API_KEY="sk-..."   # Windows PowerShell
```
3. Run proxy and frontend in two terminals:
```
npm run server
npm start
```
Frontend sends to the proxy, which forwards to OpenAI securely.

## Data Source (Current)

- The app uses a bundled local sample product list by default for stability.
- Live data has been disabled per current requirements.

If you later want live products, re-enable `fetchLiveProducts` in `src/services/productService.js` and wire it in `src/App.js`.

## Usage Examples

Try these example preferences:
- "I want a phone under $500"
- "I need wireless headphones with noise cancellation"
- "Show me Apple products"
- "I need a laptop for work"
- "Best rated tablets"
 - "Vegan protein powder under 1500"
 - "Running shoes for flat feet"

## Project Structure

```
src/
├── components/
│   ├── ProductCard.js          # Individual product display
│   └── RecommendationInput.js  # Single text input form
├── data/
│   └── products.js            # Product catalog
├── services/
│   └── aiService.js           # AI integration, intent parsing, shortlist, reasons
├── App.js                     # Main application component
├── App.css                    # Styling
└── index.js                   # Entry point

server.js                      # Minimal proxy for OpenAI (optional)
```

## Technologies Used

- **React 18** - Frontend framework
- **OpenAI GPT-3.5-turbo** - AI recommendations (optional)
- **CSS3** - Styling with modern features
- **JavaScript ES6+** - Modern JavaScript features

## Evaluation Criteria Met

✅ **Basic frontend development with React** - Clean, component-based architecture  
✅ **AI API integration** - OpenAI GPT integration with fallback system  
✅ **User input processing** - Natural language preference handling  
✅ **Product filtering** - Smart recommendation logic  
✅ **Clean and maintainable code** - Well-structured, documented codebase  
✅ **Minimal dependencies** - Only essential packages included  

## Development Time

This project was designed to be completed within the 90-minute timeframe while maintaining high code quality and user experience.
