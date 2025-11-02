# CLAUDE.md

This document provides context for Claude (or other AI assistants) when working on this project.

## Project Overview

**Income Comparison Canada** is a web application that allows Canadians to compare their employment income against others in their age group using Statistics Canada Census 2021 data.

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla HTML/CSS/JavaScript with Chart.js
- **Data**: JSON files (no database)
- **API**: RESTful endpoints

## Project Structure

```
income-comparison-canada/
├── backend/
│   ├── src/
│   │   ├── data/census-2021/           # Age-specific income JSON files
│   │   │   ├── income-canada.json      # All ages
│   │   │   ├── income-canada-age-15-24.json
│   │   │   ├── income-canada-age-25-34.json
│   │   │   ├── income-canada-age-35-44.json
│   │   │   ├── income-canada-age-45-54.json
│   │   │   ├── income-canada-age-55-64.json
│   │   │   └── income-canada-age-65plus.json
│   │   ├── routes/
│   │   │   └── incomeRoutes.js         # API endpoints
│   │   ├── services/
│   │   │   └── dataService.js          # Data loading & calculations
│   │   └── server.js                   # Express server
│   └── package.json
├── frontend/
│   └── public/
│       └── index.html                  # Complete standalone app
├── data/census-2021/                   # Documentation about data
└── README.md
```

## Key Concepts

### Age Groups
The application divides income data into 6 age groups matching Statistics Canada Census categories:
- 15-24 years
- 25-34 years
- 35-44 years
- 45-54 years
- 55-64 years
- 65+ years

### Data Structure
Each age group JSON file contains:
```json
{
  "geography": "Canada",
  "geographyCode": "CA",
  "year": 2020,
  "demographic": "age-25-34",
  "demographicLabel": "Age 25-34",
  "percentiles": {
    "p10": 8200,
    "p25": 22400,
    "p50": 43500,
    "p75": 65200,
    "p90": 89500,
    "p95": 108300,
    "p96": 115100,
    "p97": 123800,
    "p98": 138400,
    "p99": 174200
  },
  "median": 43500,
  "average": 52100,
  "totalRecipients": 4900000
}
```

### API Endpoints

#### POST /api/income/percentile
Calculate income percentile for a user.

**Required Parameters:**
- `income` (number): Annual employment income
- `age` (number): User's age (15-100)

**Response:**
```json
{
  "income": 75000,
  "age": 45,
  "ageGroup": "45-54",
  "geography": "Canada",
  "demographic": "Age 45-54",
  "percentile": 72.8,
  "belowYou": 72,
  "aboveYou": 28,
  "bracket": "Top 25%",
  "median": {
    "value": 51400,
    "difference": 23600,
    "percentDifference": 45.9
  },
  "average": {
    "value": 67200,
    "difference": 7800,
    "percentDifference": 11.6
  }
}
```

#### GET /api/income/distribution
Get full distribution data for an age group.

**Required Parameters:**
- `age` (number): User's age (15-100)

## Code Conventions

### Backend
- Use ES modules (`import`/`export`)
- File-based data storage (no database)
- All data loaded into memory on startup via `dataService.loadAllData()`
- Percentile calculation uses linear interpolation
- Age is mapped to demographic codes (e.g., 45 → "age-45-54")

### Frontend
- Standalone HTML file (no build step required)
- Uses Chart.js with chartjs-plugin-datalabels
- Responsive design with media queries
- Direct API calls with `fetch()`
- Fallback to client-side calculation if API unavailable

## Important Design Decisions

### Age is Mandatory
The application requires age input because:
1. Income varies significantly by age
2. Comparing a 25-year-old to a 55-year-old isn't meaningful
3. Age-specific comparisons are more actionable

### No Backward Compatibility
The API was simplified to focus on the core use case:
- Age parameter is required (not optional)
- Removed geography/demographic parameters
- Canada-wide data only

### Histogram vs Density Curve
The visualization uses a histogram because:
- More intuitive for general users
- Clear representation of population distribution
- Avoids mathematical complexity of density curves

## When Making Changes

### Adding New Age Groups
1. Create new JSON file in `backend/src/data/census-2021/`
2. Update `getAgeDemographic()` function in `incomeRoutes.js`
3. Update `getAgeGroupLabel()` function in `incomeRoutes.js`
4. Update frontend age validation

### Adding Geographic Filters (Provinces/Cities)
1. Add new JSON files with `geographyCode` field
2. Re-add `geography` parameter to API endpoints
3. Update `dataService.js` to handle geography lookups
4. Update frontend to include geography selector

### Modifying Percentile Calculation
The calculation is in `backend/src/services/dataService.js`:
- `calculatePercentile()` function uses linear interpolation
- Handles edge cases (below P10, above P99)
- Returns values between 0 and 99.9

## Data Source

All income data comes from:
- **Source**: Statistics Canada, Census of Population 2021
- **Reference Year**: 2020 (calendar year)
- **Variable**: Employment income
- **Definition**: "All income received as wages, salaries and commissions from paid employment and net self-employment income"
- **Population**: Persons aged 15+ with employment income

## Common Tasks

### Testing the API
```bash
# Test each age group
curl "http://localhost:3001/api/income/percentile?income=50000&age=25"
curl "http://localhost:3001/api/income/percentile?income=50000&age=45"
curl "http://localhost:3001/api/income/percentile?income=50000&age=65"

# Test edge cases
curl "http://localhost:3001/api/income/percentile?income=0&age=25"
curl "http://localhost:3001/api/income/percentile?income=300000&age=45"

# Test validation
curl "http://localhost:3001/api/income/percentile?income=50000"  # Missing age
curl "http://localhost:3001/api/income/percentile?income=50000&age=10"  # Invalid age
```

### Running the Application
```bash
# Backend (required)
cd backend
npm install
npm start  # Runs on http://localhost:3001

# Frontend (choose one)
# Option 1: Open directly in browser
open frontend/public/index.html

# Option 2: Serve with local server
cd frontend
npx serve public  # Runs on http://localhost:3000
```

## Known Limitations

1. **Data is from 2020**: Most recent complete Census data available
2. **Canada-wide only**: No provincial or city-level data currently
3. **Employment income only**: Excludes investment income, pensions, transfers
4. **No authentication**: Public API with no rate limiting
5. **In-memory data**: Backend stores all data in RAM (acceptable for current dataset size)

## Future Enhancements

Potential features to add:
- Provincial/city geographic filters
- After-tax income calculator
- Occupation-based comparisons
- Historical trends (2015 vs 2020)
- Cost of living adjustments by region
- API rate limiting
- Data caching
- Progressive Web App (PWA) features

## Debugging Tips

### API Not Returning Data
1. Check if data files exist in `backend/src/data/census-2021/`
2. Verify `dataService.loadAllData()` ran successfully on startup
3. Check console for "✓ Loaded: ..." messages
4. Verify age maps to correct demographic code

### Frontend Not Displaying Chart
1. Check browser console for errors
2. Verify Chart.js and plugins loaded correctly
3. Ensure API is running and accessible
4. Check CORS settings if running on different ports

### Percentile Seems Wrong
1. Verify correct age group is being used
2. Check percentile interpolation logic
3. Compare against raw percentile values in JSON
4. Remember: same income = different percentiles by age

## Getting Help

When asking Claude for help:
1. Mention this file: "Review CLAUDE.md for context"
2. Be specific about the issue
3. Include relevant code snippets
4. Specify which component (backend/frontend/API)
5. Provide error messages if any

## Questions Claude Can Help With

- "Add a new age group for ages 0-14"
- "Change the histogram colors"
- "Add provincial filtering"
- "Optimize the percentile calculation"
- "Make the visualization more mobile-friendly"
- "Add an occupation field"
- "Export results as PDF"
- "Add unit tests"
- "Implement API rate limiting"

---

**Last Updated**: November 2, 2025  
**Project Version**: 2.0