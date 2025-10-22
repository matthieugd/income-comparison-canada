# Project Structure

Complete overview of the Income Comparison Canada repository structure.

```
income-comparison-canada/
│
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── IncomeDistributionViz.jsx    # Main visualization component
│   │   ├── App.jsx                          # Main app component
│   │   ├── main.jsx                         # React entry point
│   │   └── index.css                        # Global styles with Tailwind
│   ├── public/                        # Static assets (empty initially)
│   ├── index.html                     # HTML template
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   └── .env.example                  # Environment variables template
│
├── backend/                           # Express.js API server
│   ├── src/
│   │   ├── data/
│   │   │   └── census-2021/
│   │   │       └── income-canada.json       # Census data file
│   │   ├── routes/
│   │   │   └── incomeRoutes.js              # API route handlers
│   │   ├── services/
│   │   │   └── dataService.js               # Data loading & calculations
│   │   └── server.js                        # Express server entry point
│   ├── package.json                   # Backend dependencies
│   └── .env.example                  # Environment variables template
│
├── data/                             # Data documentation and tools
│   └── census-2021/
│       └── README.md                 # Data structure documentation
│
├── docs/                             # Project documentation
│   └── income_comparison_website_guide.md   # Original planning guide
│
├── .gitignore                        # Git ignore rules
├── README.md                         # Main project documentation
├── CLAUDE.md                         # Claude Code integration guide
├── SETUP.md                          # Setup and installation guide
├── GITHUB_SETUP.md                   # GitHub push instructions
├── CONTRIBUTING.md                   # Contribution guidelines
├── LICENSE                           # MIT License
└── PROJECT_STRUCTURE.md              # This file
```

## Key Files Explained

### Root Level

- **README.md**: Main project overview, features, API docs, and general information
- **CLAUDE.md**: Documentation for Claude Code - provides context for AI-assisted development
- **SETUP.md**: Step-by-step setup instructions for local development
- **GITHUB_SETUP.md**: Instructions for pushing the project to GitHub
- **CONTRIBUTING.md**: Guidelines for contributing to the project
- **LICENSE**: MIT License for open source distribution
- **.gitignore**: Specifies files/folders Git should ignore (node_modules, .env, etc.)

### Frontend (`/frontend`)

**Main Application**
- `src/App.jsx`: Root component, includes header and footer
- `src/main.jsx`: React entry point that renders App
- `index.html`: HTML template with root div

**Components**
- `src/components/IncomeDistributionViz.jsx`: Main visualization component
  - Handles user input
  - Calls backend API
  - Draws animated canvas visualization
  - Displays comparison statistics

**Configuration**
- `vite.config.js`: Vite build tool configuration
- `tailwind.config.js`: Tailwind CSS customization
- `postcss.config.js`: PostCSS plugins (Tailwind, Autoprefixer)
- `package.json`: Dependencies and scripts

**Styles**
- `src/index.css`: Global CSS with Tailwind directives

**Environment**
- `.env.example`: Template for environment variables
  - `VITE_API_URL`: Backend API URL

### Backend (`/backend`)

**Server**
- `src/server.js`: Express server setup
  - CORS configuration
  - Route mounting
  - Error handling
  - Data loading on startup

**Routes**
- `src/routes/incomeRoutes.js`: API endpoint handlers
  - `/api/income/percentile`: Calculate user's percentile
  - `/api/income/distribution`: Get distribution data
  - `/api/income/geographies`: List available regions
  - `/api/income/demographics`: List demographic filters

**Services**
- `src/services/dataService.js`: Core business logic
  - Loads JSON data files into memory
  - Percentile calculation algorithm
  - Data querying functions
  - Income bracket classification

**Data**
- `src/data/census-2021/`: Census data JSON files
  - `income-canada.json`: National income distribution

**Configuration**
- `package.json`: Dependencies and scripts
- `.env.example`: Template for environment variables
  - `PORT`: Server port (default 3001)
  - `NODE_ENV`: Environment (development/production)
  - `FRONTEND_URL`: Frontend URL for CORS

### Data (`/data`)

Documentation and reference data (not used at runtime):
- `census-2021/README.md`: Detailed data structure guide

### Documentation (`/docs`)

- `income_comparison_website_guide.md`: Original planning document

## Data Flow

1. **Startup**: Backend loads all JSON files from `backend/src/data/census-2021/` into memory
2. **User Input**: User enters income in frontend
3. **API Call**: Frontend sends GET request to `/api/income/percentile?income={value}`
4. **Calculation**: Backend calculates percentile using loaded data
5. **Response**: Backend returns percentile, bracket, and comparison stats
6. **Visualization**: Frontend animates character walking to user's position
7. **Display**: Results shown in stat cards below the chart

## Technology Stack Details

### Frontend Dependencies
```json
{
  "react": "^18.2.0",           // UI library
  "react-dom": "^18.2.0",       // React DOM rendering
  "lucide-react": "^0.294.0",   // Icon library
  "recharts": "^2.10.3",        // Additional charting (optional)
  "vite": "^5.0.8",             // Build tool & dev server
  "tailwindcss": "^3.3.6"       // Utility-first CSS
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.2",     // Web framework
  "cors": "^2.8.5",         // CORS middleware
  "dotenv": "^16.3.1",      // Environment variables
  "nodemon": "^3.0.1"       // Dev auto-reload
}
```

## File Sizes (Approximate)

- Backend server: ~50 KB (excluding node_modules)
- Frontend build: ~200 KB (excluding node_modules)
- Census data JSON: ~2 KB per file
- Total repository (no dependencies): <1 MB

## Scripts Available

### Backend (`cd backend`)
- `npm start`: Start production server
- `npm run dev`: Start development server with auto-reload

### Frontend (`cd frontend`)
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Environment Files

Both frontend and backend have `.env.example` files. Copy these to `.env` for local development:

```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd frontend
cp .env.example .env
```

## Adding New Files

### New Census Data
Add to: `backend/src/data/census-2021/{geography-code}.json`

### New API Endpoints
1. Add route in: `backend/src/routes/incomeRoutes.js`
2. Add service logic in: `backend/src/services/dataService.js`

### New React Components
Add to: `frontend/src/components/{ComponentName}.jsx`

### New Documentation
Add to: `docs/{document-name}.md`

## Git Structure

The repository has:
- 1 main branch: `main`
- 1 initial commit with all files
- Clean commit history ready for GitHub

## Next Steps

1. Push to GitHub (see GITHUB_SETUP.md)
2. Install dependencies (`npm install` in both directories)
3. Start development (see SETUP.md)
4. Add more census data files
5. Customize and extend features

---

This structure follows best practices for:
- Separation of concerns (frontend/backend)
- Clear file organization
- Scalable architecture
- Easy maintenance
- Developer-friendly setup
