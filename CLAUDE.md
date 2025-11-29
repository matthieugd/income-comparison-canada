# CLAUDE.md

This document provides context for Claude (or other AI assistants) when working on this project.

## Project Overview

**Income Comparison Canada** is a 100% static web application that allows Canadians to compare their employment income and household income against others using Statistics Canada Census 2021 data.

**Key Architecture**: This application has **NO backend server** - all data loading and calculations happen client-side in the browser.

## Tech Stack

- **Architecture**: 100% static (no backend server required)
- **Frontend**: Vanilla HTML/CSS/JavaScript with Chart.js
- **Data Storage**: Static JSON files with smart caching
- **Caching**: localStorage + in-memory cache with version control
- **i18n**: i18next for bilingual support (EN/FR)
- **Deployment**: Any static hosting (GitHub Pages, Netlify, Vercel, Cloudflare Pages)

## Project Structure

```
income-comparison-canada/
└── frontend/public/
    ├── index.html                      # Complete standalone application (~100KB)
    └── data/
        ├── manifest.json               # Version control for cache invalidation
        ├── income-canada-age-15-19.json
        ├── income-canada-age-20-24.json
        ├── income-canada-age-25-29.json
        ├── income-canada-age-30-34.json
        ├── income-canada-age-35-39.json
        ├── income-canada-age-40-44.json
        ├── income-canada-age-45-49.json
        ├── income-canada-age-50-54.json
        ├── income-canada-age-55-59.json
        ├── income-canada-age-60-64.json
        ├── income-canada-age-65plus.json
        └── household-income-canada.json
```

## Key Concepts

### Two Comparison Modes

1. **Individual Salary Comparison** (11 age groups):
   - 15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65+
   - Uses detailed percentile data (P10, P25, P50, P75, P90, P95, P99)
   - Age-specific calculations

2. **Household Income Comparison** (quintiles):
   - 5 income groups (Q1-Q5, 20% each)
   - Uses quintile average incomes
   - Not age-specific

### Individual Salary Data Structure
Each age group JSON file (e.g., `income-canada-age-30-34.json`) contains:
```json
{
  "geography": "Canada",
  "geographyCode": "CA",
  "geographyType": "country",
  "year": 2020,
  "demographic": "age-30-34",
  "demographicLabel": "Age 30-34",
  "demographicType": "age",
  "percentiles": {
    "p10": 7700,
    "p25": 22600,
    "p50": 46400,
    "p75": 72500,
    "p90": 99000,
    "p95": 119000,
    "p96": 127000,
    "p97": 137000,
    "p98": 153000,
    "p99": 186000
  },
  "median": 46400,
  "average": 52550
}
```

### Household Income Data Structure
The `household-income-canada.json` file contains:
```json
{
  "geography": "Canada",
  "geographyCode": "CA",
  "year": 2020,
  "type": "household",
  "quintiles": {
    "q1": {
      "label": "First Quintile (Q1)",
      "average": 39927,
      "percentage": 20
    },
    "q2": {
      "label": "Second Quintile (Q2)",
      "average": 80795,
      "percentage": 20
    }
    // ... q3, q4, q5
  }
}
```

### Version Manifest Structure
The `manifest.json` file controls cache invalidation:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-08",
  "files": {
    "income-canada-age-15-19": "1.0.0",
    "income-canada-age-20-24": "1.0.0",
    // ... other files
    "household-income-canada": "1.0.0"
  }
}
```

## Code Conventions

### Application Architecture
- **100% client-side**: All logic runs in the browser
- **No backend**: No server, no API endpoints
- **No build step**: Single HTML file with inline JavaScript
- **Smart caching**: localStorage + in-memory with version control
- **Bilingual**: i18next for EN/FR translations

### Data Loading Flow
1. User opens page → `dataCache.getManifest()` checks version
2. User enters income/age → `dataCache.getData(filename)` loads JSON
3. Check memory cache → Check localStorage → Fetch from server
4. Store in both caches for future use
5. Calculate percentile client-side → Display results

### Key Functions (in index.html)

**Data Management:**
- `DataCache` class: Handles caching with version control
- `dataCache.getManifest()`: Loads version manifest
- `dataCache.getData(filename)`: Gets JSON with caching

**Helper Functions:**
- `getAgeDemographic(age)`: Maps age to demographic code (e.g., 30 → "age-30-34")
- `getAgeGroupLabel(age)`: Gets display label (e.g., 30 → "30-34")
- `getDataFilename(age)`: Constructs filename (e.g., "income-canada-age-30-34")

**Calculation Functions:**
- `calculatePercentile(income, distribution)`: Linear interpolation between percentiles
- `getIncomeBracket(percentile)`: Returns bracket label (Top 1%, Top 5%, etc.)
- `calculateHouseholdQuintile(income, quintiles)`: Determines quintile using midpoints
- `calculateHouseholdPercentile(income, quintiles)`: Interpolates percentile within quintile
- `getHouseholdBracket(quintile)`: Returns quintile label

**Main Calculation Functions:**
- `calculateIndividual()`: Handles individual salary comparison
- `calculateHousehold()`: Handles household income comparison

## Important Design Decisions

### Static Architecture
The application was converted from backend+frontend to 100% static because:
1. **No server costs**: Deploy to free static hosting (GitHub Pages, Netlify, etc.)
2. **Infinite scalability**: CDN handles all traffic automatically
3. **Lightning fast**: Client-side caching makes subsequent loads instant
4. **Simpler deployment**: Just push files, no server configuration
5. **Offline-ready**: Can be extended with Service Workers for offline support

### Age is Mandatory (Individual Mode)
The application requires age input for individual salary comparison because:
1. Income varies significantly by age
2. Comparing a 25-year-old to a 55-year-old isn't meaningful
3. Age-specific comparisons are more actionable
4. Statistics Canada provides age-segmented data

### Quintiles vs Percentiles
- **Individual mode**: Uses percentiles (P10, P25, P50, etc.) for precision
- **Household mode**: Uses quintiles (5 groups of 20%) because StatCan household data comes in quintiles

### Histogram vs Density Curve
The visualization uses a histogram because:
- More intuitive for general users
- Clear representation of population distribution
- Avoids mathematical complexity of density curves

### Client-Side Caching Strategy
Three-tier caching system:
1. **Memory cache**: Instant access (same session)
2. **localStorage**: Persistent across sessions (~50KB limit, well within)
3. **Network**: Fetch from server only if not cached

Cache invalidation triggers:
- Version mismatch in manifest.json
- User clears localStorage
- 15-day TTL (could be added)

## When Making Changes

### Adding New Age Groups
1. Create new JSON file in `frontend/public/data/`
2. Update `getAgeDemographic()` function in `index.html`
3. Update `getAgeGroupLabel()` function in `index.html`
4. Update frontend age validation
5. Add filename to `manifest.json`

### Updating Income Data
1. Edit JSON files in `frontend/public/data/`
2. Increment version in `frontend/public/data/manifest.json`:
   ```json
   {
     "version": "1.0.1",  // Increment this
     "lastUpdated": "2025-11-15"
   }
   ```
3. Deploy - users automatically get new version

### Modifying Percentile Calculation
The calculation is in `index.html` (search for `function calculatePercentile`):
- Uses linear interpolation between known percentiles
- Handles edge cases (below P10, above P99)
- Returns values between 0 and 99.9

### Adding Geographic Filters (Provinces/Cities)
1. Create new JSON files with `geographyCode` field
2. Add geography selector to UI
3. Update `getData()` calls to include geography parameter
4. Modify `getDataFilename()` to include geography

## Data Sources

### Individual Salary Data
- **Source**: Statistics Canada, Census of Population 2021
- **Reference Year**: 2020 (calendar year)
- **Variable**: Employment income
- **Definition**: "All income received as wages, salaries and commissions from paid employment and net self-employment income"
- **Population**: Persons aged 15+ with employment income
- **Age Groups**: 11 groups (15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65+)

### Household Income Data
- **Source**: Statistics Canada, Household Income Survey (Table 36-10-0587-01)
- **Reference Year**: 2024
- **Variable**: Household income (approximated from disposable income + current transfers paid)
- **Distribution**: Quintiles (5 groups of 20% each)

## Common Tasks

### Running Locally for Development
```bash
# Serve the static files with any HTTP server
cd frontend/public
python3 -m http.server 8000
# Open http://localhost:8000

# Or use npx
npx serve frontend/public

# Or use http-server
npx http-server frontend/public
```

### Testing the Application
Open browser console and test:
```javascript
// Check cache
console.log(localStorage.getItem('data_version'));
console.log(localStorage.getItem('data_income-canada-age-30-34'));

// Clear cache manually
localStorage.clear();

// Test calculations manually
const testIncome = 50000;
const testAge = 30;
calculateIndividual(); // After entering values in form
```

### Deploying to Production
```bash
# GitHub Pages
git add .
git commit -m "Deploy static app"
git push origin main
# Enable GitHub Pages in repo settings → Pages → Source: main → /frontend/public

# Netlify
# Drag and drop frontend/public folder to netlify.com

# Vercel
cd frontend/public
vercel --prod

# Cloudflare Pages
# Connect repo, set output directory to frontend/public
```

## Known Limitations

1. **Individual data from 2020**: Most recent complete Census data available (Census 2021 reports 2020 income)
2. **Household data from 2024**: Annual household survey data
3. **Canada-wide only**: No provincial or city-level data currently
4. **Employment income only (individual)**: Excludes investment income, pensions, transfers
5. **Browser storage limits**: localStorage has ~5-10MB limit (we use ~50KB)
6. **Requires JavaScript**: No fallback for JavaScript-disabled browsers

## Future Enhancements

Potential features to add:
- **Provincial/city filters**: Add geographic segmentation
- **After-tax calculator**: Show post-tax income comparisons
- **Occupation filters**: Compare by job type
- **Historical trends**: Compare 2015 vs 2020 vs 2025 census data
- **Cost of living adjustments**: Regional purchasing power parity
- **PWA support**: Service Worker for offline functionality
- **Export features**: PDF/image export of results
- **Sharing**: Social media share buttons
- **Analytics**: Anonymous usage tracking (privacy-respecting)

## Debugging Tips

### Data Not Loading
1. **Check browser console** for errors
2. **Verify JSON files exist** in `frontend/public/data/`
3. **Check manifest.json** is valid JSON
4. **Test with cleared cache**: `localStorage.clear()` in console
5. **Verify CORS**: Must serve via HTTP server, not `file://` protocol

### Chart Not Displaying
1. **Check browser console** for Chart.js errors
2. **Verify Chart.js loaded**: Look for `<script src="https://cdn.jsdelivr.net/npm/chart.js..."`
3. **Check data structure**: Console log `distribution.percentiles`
4. **Test with simple data**: Manually call `createChart()` with test data

### Percentile Seems Wrong
1. **Verify correct age group**: Check `getAgeDemographic(age)` returns expected code
2. **Check raw data**: Console log the loaded JSON file
3. **Test interpolation**: Manually call `calculatePercentile()` with known values
4. **Remember age matters**: Same income = different percentiles by age

### Cache Issues
1. **Clear localStorage**: `localStorage.clear()` in console
2. **Check version**: `localStorage.getItem('data_version')`
3. **Force refresh**: Increment version in manifest.json
4. **Disable cache**: Browser DevTools → Network tab → Disable cache

## Getting Help

When asking Claude for help:
1. Mention this file: "Review CLAUDE.md for context"
2. Be specific about the issue
3. Include relevant code snippets or browser console errors
4. Specify which mode (individual/household) is affected
5. Mention what you've already tried

## Questions Claude Can Help With

### Data & Content
- "Add a new age group for ages 0-14"
- "Update the income data for 2025 Census"
- "Add provincial/city filtering"
- "Change the income quintile boundaries"

### UI & Visualization
- "Change the histogram colors"
- "Make the chart more mobile-friendly"
- "Add a dark mode toggle"
- "Improve accessibility (ARIA labels, keyboard nav)"
- "Add animations to the chart"

### Features
- "Add export to PDF functionality"
- "Add social sharing buttons"
- "Create a comparison history feature"
- "Add an after-tax calculator"
- "Implement Service Worker for offline mode"

### Technical
- "Optimize the caching strategy"
- "Add compression to JSON files"
- "Implement lazy loading for chart library"
- "Add error boundaries for better error handling"
- "Optimize bundle size"

### Deployment
- "Help me deploy to GitHub Pages"
- "Configure custom domain on Netlify"
- "Add CI/CD pipeline for auto-deployment"
- "Set up analytics (privacy-focused)"

---

**Last Updated**: November 8, 2025
**Project Version**: 3.0 (Static Architecture)
**Architecture**: 100% Static (No Backend)