# Income Comparison Canada 🇨🇦

An interactive web application that allows Canadians to compare their employment income against the national distribution using Statistics Canada Census 2021 data.

## Features

- 🎯 Interactive income distribution visualization
- 📊 Animated character walking along the distribution curve
- 📈 Real-time percentile calculation
- 🗺️ Comparison across provinces and cities
- 👥 Demographic filtering (age, gender)
- 📱 Responsive design

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Recharts (additional charts)

### Backend
- Node.js
- Express.js
- CORS enabled
- File-based data storage (no database)

## Project Structure

```
income-comparison-canada/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/            # Express API server
│   ├── src/
│   │   ├── data/      # Census data JSON files
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
├── data/              # Raw census data and scripts
│   └── census-2021/
├── docs/              # Documentation
├── .gitignore
├── CLAUDE.md          # Claude Code configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/income-comparison-canada.git
cd income-comparison-canada
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```
The API will be available at `http://localhost:3001`

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```
The application will open at `http://localhost:5173`

## API Endpoints

### GET `/api/income/percentile`
Calculate percentile rank for a given income.

**Query Parameters:**
- `income` (required): Annual employment income in CAD
- `geography` (optional): Geographic region code (default: 'CA')
- `demographic` (optional): Demographic filter (e.g., 'age-25-34')

**Response:**
```json
{
  "income": 65000,
  "percentile": 82.5,
  "belowYou": 82,
  "aboveYou": 18,
  "median": 37358,
  "average": 53939,
  "bracket": "Top 25%"
}
```

### GET `/api/income/distribution`
Get income distribution data for visualization.

**Query Parameters:**
- `geography` (optional): Geographic region code

**Response:**
```json
{
  "geography": "Canada",
  "year": 2020,
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

### GET `/api/geographies`
Get list of available geographic regions.

### GET `/api/demographics`
Get list of available demographic filters.

## Data Source

All income data is sourced from **Statistics Canada Census 2021**, measuring employment income for the 2020 calendar year.

- **Source:** Census of Population, 2021
- **Variable:** Employment income in 2020
- **Reference:** Based on the income_comparison_website_guide.md

## Development

### Adding New Data

1. Add census data JSON files to `backend/src/data/`
2. Update the data loading service in `backend/src/services/dataService.js`
3. Test the API endpoints

### Modifying the Visualization

The main visualization component is in `frontend/src/components/IncomeDistributionViz.jsx`

## Deployment

### Frontend
- Can be deployed to Vercel, Netlify, or any static hosting service
- Build command: `npm run build`
- Output directory: `dist/`

### Backend
- Can be deployed to Render, Railway, Fly.io, or any Node.js hosting
- Start command: `npm start`
- Ensure environment variables are set (see `.env.example`)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Data source: Statistics Canada Census 2021
- Inspired by income comparison tools from around the world
- Built with assistance from Claude by Anthropic

## Contact

For questions or suggestions, please open an issue on GitHub.

---

Made with ❤️ in Canada
