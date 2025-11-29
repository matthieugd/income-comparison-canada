# Income Comparison Canada 🇨🇦

Compare your employment income against other Canadians in your age group using Statistics Canada Census 2021 data.

**Live Demo**: [https://your-deployment-url.com](https://your-deployment-url.com)

## Features

- 📊 **Individual Salary Comparison**: Compare by 11 age groups (15-19, 20-24, 25-29, etc.)
- 🏠 **Household Income Comparison**: Compare household income by quintiles
- 📈 Real-time percentile calculation using client-side processing
- 📉 Interactive histogram visualization with position indicator
- 🌐 Bilingual support (English & French)
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Lightning fast with intelligent caching (localStorage + in-memory)
- 🚀 100% static - no server required
- ❓ Comprehensive FAQ section

## Quick Start

### Local Development
```bash
# Serve the static files with any HTTP server
cd frontend/public
python3 -m http.server 8000
# Open http://localhost:8000
```

Or use any other static server:
```bash
npx serve frontend/public
# or
npx http-server frontend/public
```

### Deploy to Production

The application is 100% static and can be deployed to any static hosting:

**GitHub Pages:**
```bash
git add .
git commit -m "Deploy static app"
git push origin main
# Enable GitHub Pages in repo settings
```

**Netlify:** Drag and drop `frontend/public` folder to [netlify.com](https://netlify.com)

**Vercel:**
```bash
cd frontend/public
vercel --prod
```

**Cloudflare Pages:** Connect your repo and set output directory to `frontend/public`

## How It Works

This application requires **no backend server**. All calculations happen in the browser:

1. **First Visit**: Downloads manifest + required JSON files (~5-10KB)
2. **Caching**: Stores data in localStorage with version checking
3. **Calculations**: Performs percentile calculations client-side
4. **Updates**: Auto-invalidates cache when data version changes

### Architecture

- **No API calls** - Data loaded directly from JSON files
- **Smart caching** - localStorage + in-memory cache
- **Version control** - Manifest-based cache invalidation
- **Instant results** - All processing happens client-side

## Data Sources

### Individual Salary Data
- **Source**: Statistics Canada, Census of Population 2021
- **Income Year**: 2020
- **Variable**: Employment income (wages, salaries, commissions)
- **Population**: Persons aged 15+ with employment income
- **Age Groups**: 11 groups (15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65+)

### Household Income Data
- **Source**: Statistics Canada, Household Income Survey (Table 36-10-0587-01)
- **Income Year**: 2024
- **Variable**: Household income (approximated from disposable income + transfers)
- **Distribution**: Quintiles (5 groups of 20% each)

## Project Structure

```
income-comparison-canada/
└── frontend/public/
    ├── index.html                  # Complete standalone application
    └── data/
        ├── manifest.json           # Version control for cache invalidation
        ├── income-canada-age-15-19.json
        ├── income-canada-age-20-24.json
        ├── ... (11 age group files)
        └── household-income-canada.json
```

## Updating Data

When you need to update the income data:

1. **Update JSON files** in `frontend/public/data/`
2. **Increment version** in `frontend/public/data/manifest.json`:
   ```json
   {
     "version": "1.0.1",  // Change this
     "lastUpdated": "2024-11-15",
     "files": { ... }
   }
   ```
3. **Deploy** - Users will automatically get new data on next visit

## Technical Details

### Client-Side Calculations

All income percentile calculations happen in the browser using:
- Linear interpolation between percentile markers
- Midpoint-based quintile boundaries
- Age-group specific distributions

### Caching Strategy

- **Memory Cache**: Instant access after first load
- **localStorage**: ~50KB persistent cache
- **Version Checking**: Automatic invalidation on data updates
- **Fallback**: Works even if localStorage unavailable

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- localStorage support (all modern browsers)
- ES6+ JavaScript features

## Performance

- **Initial Load**: ~100ms (downloads 1-2 JSON files)
- **Subsequent Loads**: ~5ms (uses cache)
- **Total Data Size**: ~50KB (all files combined)
- **CDN Cached**: Infinite scalability

## License

MIT
