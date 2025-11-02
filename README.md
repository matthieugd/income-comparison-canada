# Income Comparison Canada 🇨🇦

Compare your employment income against other Canadians in your age group using Statistics Canada Census 2021 data.

## Features

- 📊 Age-based income comparison (6 age groups: 15-24, 25-34, 35-44, 45-54, 55-64, 65+)
- 📈 Real-time percentile calculation within your age group
- 📉 Clean histogram visualization with percentile labels
- 📱 Fully responsive design (mobile, tablet, desktop)
- ❓ FAQ section

## Quick Start

### Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
# Option 1: Open directly
open public/index.html

# Option 2: Serve with a local server
npx serve public
```

## API

### Get Percentile
```bash
GET /api/income/percentile?income=75000&age=45
```

**Parameters:**
- `income` (required): Annual employment income
- `age` (required): User's age (15-100)

**Response:**
```json
{
  "income": 75000,
  "age": 45,
  "ageGroup": "45-54",
  "percentile": 72.8,
  "bracket": "Top 25%",
  "median": {
    "value": 51400,
    "difference": 23600,
    "percentDifference": 45.9
  }
}
```

### Get Distribution
```bash
GET /api/income/distribution?age=45
```

Returns full percentile distribution for the age group.

## Data Source

- **Source**: Statistics Canada, Census of Population 2021
- **Income Year**: 2020
- **Variable**: Employment income
- **Population**: Persons aged 15+ with employment income

## Age Groups

| Age Range | Median Income | Average Income |
|-----------|---------------|----------------|
| 15-24     | $12,500       | $16,800        |
| 25-34     | $43,500       | $52,100        |
| 35-44     | $52,800       | $66,300        |
| 45-54     | $51,400       | $67,200        |
| 55-64     | $43,200       | $60,100        |
| 65+       | $12,800       | $26,400        |

## Project Structure

```
income-comparison-canada/
├── backend/
│   ├── src/
│   │   ├── data/census-2021/    # Age-specific income data
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Business logic
│   │   └── server.js
│   └── package.json
├── frontend/
│   └── public/
│       └── index.html            # Standalone visualization
└── README.md
```

## License

MIT
