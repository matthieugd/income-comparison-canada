# Income Comparison Canada - Claude Code Guide

This document provides context for Claude Code to assist with development on this project.

## Project Overview

A web application that allows Canadians to compare their employment income against national and regional distributions using Statistics Canada Census 2021 data. The app features an animated visualization showing where users fall in the income distribution.

## Architecture

### Frontend (React + Vite)
- Located in `/frontend` directory
- Built with React 18, Vite, Tailwind CSS
- Main component: `IncomeDistributionViz.jsx` - interactive income distribution with animated character
- Communicates with backend API for income data

### Backend (Node.js + Express)
- Located in `/backend` directory
- RESTful API serving census data
- Data stored in JSON files, loaded into memory (no database)
- CORS enabled for frontend communication

## Key Components

### Frontend Components
1. **IncomeDistributionViz.jsx** - Main visualization component
   - Canvas-based animated distribution curve
   - Walking character animation
   - Percentile calculation display
   - Uses Census 2021 data via API

2. **App.jsx** - Main application wrapper
   - Routing (if needed)
   - Global state management

### Backend Services
1. **dataService.js** - Loads and manages census data
   - Reads JSON files from `/backend/src/data/`
   - Provides in-memory data access
   - Calculates percentiles

2. **incomeRoutes.js** - API endpoints
   - `/api/income/percentile` - Calculate user's percentile
   - `/api/income/distribution` - Get distribution data
   - `/api/geographies` - List available regions
   - `/api/demographics` - List demographic filters

## Data Structure

Census data is stored in JSON files with this structure:

```json
{
  "geography": "Canada",
  "geographyCode": "CA",
  "year": 2020,
  "demographic": "all",
  "percentiles": {
    "p10": 5200,
    "p25": 16900,
    "p50": 37358,
    "p75": 67800,
    "p90": 102000,
    "p95": 129700,
    "p99": 216200
  },
  "median": 37358,
  "average": 53939,
  "totalRecipients": 27000000
}
```

## Development Workflow

### Running Locally
1. Backend: `cd backend && npm run dev` (runs on port 3001)
2. Frontend: `cd frontend && npm run dev` (runs on port 5173)

### Common Tasks

#### Adding New Geographic Data
1. Create JSON file in `backend/src/data/census-2021/`
2. Follow naming convention: `income-{geography-code}.json`
3. Restart backend server to reload data

#### Modifying the Visualization
- Edit `frontend/src/components/IncomeDistributionViz.jsx`
- Canvas drawing logic is in the `useEffect` hook
- Animation logic uses `requestAnimationFrame`

#### Adding New API Endpoints
1. Add route in `backend/src/routes/incomeRoutes.js`
2. Implement logic in `backend/src/services/incomeService.js`
3. Update API documentation in README.md

## Key Algorithms

### Percentile Calculation
Uses linear interpolation between known percentile points:
- Given user income and percentile data
- Find bracketing percentiles (e.g., between p75 and p90)
- Interpolate position within that range

### Distribution Curve Generation
Creates a skewed distribution curve approximating income distribution:
- Peak around 30-40th percentile
- Long tail to the right (high earners)
- Uses combination of quadratic rise and exponential decay

## Dependencies

### Frontend
- `react` & `react-dom` - UI framework
- `vite` - Build tool
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `recharts` - Additional charting

### Backend
- `express` - Web framework
- `cors` - Cross-origin support
- `dotenv` - Environment variables
- `nodemon` - Development auto-reload

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
```

## Testing Approach

### Manual Testing
1. Test various income inputs (low, median, high, extreme)
2. Verify percentile calculations against census data
3. Check animation smoothness
4. Test responsive design on mobile

### API Testing
Use curl or Postman to test endpoints:
```bash
curl "http://localhost:3001/api/income/percentile?income=65000"
```

## Code Style

- Use ES6+ features (arrow functions, destructuring, etc.)
- Functional React components with hooks
- Async/await for asynchronous operations
- Clear, descriptive variable names
- Comments for complex logic

## Common Issues

### CORS Errors
- Ensure backend CORS is configured to allow frontend origin
- Check that API_URL in frontend matches backend address

### Data Loading Issues
- Verify JSON files are valid
- Check file paths in dataService.js
- Ensure data files are in correct directory structure

### Animation Performance
- Canvas rendering can be intensive
- Limit canvas redraw frequency if needed
- Use requestAnimationFrame for smooth animations

## Future Enhancements

Potential features to add:
- [ ] Historical comparison (2019 vs 2020)
- [ ] Cost of living adjustments by city
- [ ] Occupation-based comparisons
- [ ] After-tax income calculator
- [ ] Social sharing of results
- [ ] Multiple language support (FR/EN)

## Resources

- [Statistics Canada Census Data](https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/index.cfm)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Canvas API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## Project-Specific Conventions

### File Naming
- React components: PascalCase (e.g., `IncomeDistributionViz.jsx`)
- Services/utilities: camelCase (e.g., `dataService.js`)
- Data files: kebab-case (e.g., `income-canada.json`)

### Git Commit Messages
- Use conventional commits format
- Examples:
  - `feat: add provincial comparison feature`
  - `fix: correct percentile calculation for edge cases`
  - `docs: update API documentation`
  - `refactor: optimize data loading performance`

## Contact & Support

This is an open-source project. For questions or contributions, please open an issue or pull request on GitHub.

---

**Note for Claude Code:** When working on this project, prioritize:
1. Data accuracy (percentile calculations must be correct)
2. User experience (smooth animations, clear information)
3. Code maintainability (clean, documented code)
4. Performance (efficient data loading and rendering)
