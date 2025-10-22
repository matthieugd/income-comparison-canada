# Census Data

This directory contains income distribution data from Statistics Canada Census 2021.

## Data Structure

Each JSON file should follow this structure:

```json
{
  "geography": "Geographic region name",
  "geographyCode": "Unique code (e.g., CA, ON, 35535)",
  "geographyType": "Type: country, province, CMA, city",
  "year": 2020,
  "demographic": "all or specific demographic filter",
  "demographicLabel": "Human-readable demographic description",
  "demographicType": "Type: all, age, gender, education, etc.",
  "percentiles": {
    "p10": 0,
    "p25": 0,
    "p50": 0,
    "p75": 0,
    "p90": 0,
    "p95": 0,
    "p96": 0,
    "p97": 0,
    "p98": 0,
    "p99": 0
  },
  "median": 0,
  "average": 0,
  "totalRecipients": 0,
  "source": "Statistics Canada, Census of Population, 2021",
  "notes": "Optional additional information"
}
```

## Data Sources

### Primary Source
**Statistics Canada Census of Population 2021**
- Website: https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/index.cfm
- Variable: Employment income in 2020
- Population: Persons aged 15+ with employment income

### How to Find Data

1. Visit the Census Profile page
2. Select your geographic area
3. Navigate to "Income" section
4. Look for "Employment income" statistics
5. Find percentile data and median/average values

### Available Geographies

Statistics Canada provides data for:
- Canada (national)
- Provinces and territories (13)
- Census Metropolitan Areas (CMAs) (~40 major cities)
- Census agglomerations
- Cities and municipalities
- Census divisions
- Census subdivisions

### Available Demographics

You can filter by:
- Age groups (15-24, 25-34, 35-44, 45-54, 55-64, 65+)
- Gender (Men+, Women+)
- Education level
- Occupation (NOC 2021)
- Industry
- Immigration status
- Visible minority status
- Indigenous identity

## Adding New Data

To add new geographic or demographic data:

1. Download data from Statistics Canada
2. Create a new JSON file following the structure above
3. Name the file descriptively: `income-{geography-code}.json`
4. Place it in `backend/src/data/census-2021/`
5. Restart the backend server

The application will automatically load all JSON files in this directory.

## Data Validation

Ensure your data files:
- Are valid JSON
- Include all required fields
- Use consistent geography codes
- Have percentiles in ascending order
- Match the median with p50
- Include the data source

## Example Files

See `income-canada.json` for a complete example of the national data.

## Notes

- All income values are in Canadian dollars (CAD)
- Reference year is 2020 (from Census 2021)
- Employment income includes wages, salaries, commissions, and self-employment income
- Does not include investment income, pensions, or government transfers

## License

Census data is provided by Statistics Canada and is subject to their terms of use.
This project uses publicly available aggregate statistics only.
