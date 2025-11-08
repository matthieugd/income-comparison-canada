import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store
const dataStore = {
  distributions: new Map(),
  geographies: [],
  demographics: [],
  householdData: null
};

/**
 * Load all census data files from the data directory into memory
 */
export function loadAllData() {
  const dataDir = path.join(__dirname, '../data/census-2021');
  
  try {
    // Check if directory exists
    if (!fs.existsSync(dataDir)) {
      console.warn(`Data directory not found: ${dataDir}`);
      console.warn('Creating directory and loading default Canada data...');
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read all JSON files from data directory
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('No additional data files found. Using default Canada data only.');
      return;
    }

    console.log(`Found ${files.length} data file(s) to load`);

    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      // Check if this is household data
      if (data.type === 'household') {
        dataStore.householdData = data;
        console.log(`✓ Loaded: Household Income Data - ${data.geography}`);
        return;
      }

      // Store individual income data by geography code and demographic
      const key = `${data.geographyCode}-${data.demographic || 'all'}`;
      dataStore.distributions.set(key, data);

      // Track unique geographies
      if (!dataStore.geographies.find(g => g.code === data.geographyCode)) {
        dataStore.geographies.push({
          code: data.geographyCode,
          name: data.geography,
          type: data.geographyType || 'country'
        });
      }

      // Track unique demographics
      if (data.demographic && data.demographic !== 'all') {
        if (!dataStore.demographics.find(d => d.code === data.demographic)) {
          dataStore.demographics.push({
            code: data.demographic,
            name: data.demographicLabel || data.demographic,
            type: data.demographicType || 'other'
          });
        }
      }

      console.log(`✓ Loaded: ${data.geography} - ${data.demographic || 'all'}`);
    });

    console.log(`Total distributions loaded: ${dataStore.distributions.size}`);
    console.log(`Geographies available: ${dataStore.geographies.length}`);
    console.log(`Demographics available: ${dataStore.demographics.length}`);

  } catch (error) {
    console.error('Error loading data:', error);
  }
}

/**
 * Get distribution data for a specific geography and demographic
 */
export function getDistribution(geographyCode = 'CA', demographic = 'all') {
  const key = `${geographyCode}-${demographic}`;
  const data = dataStore.distributions.get(key);
  
  return data;
}

/**
 * Get all available geographies
 */
export function getGeographies() {
  return dataStore.geographies;
}

/**
 * Get all available demographics
 */
export function getDemographics() {
  return dataStore.demographics;
}

/**
 * Calculate percentile rank for a given income
 */
export function calculatePercentile(income, distribution) {
  if (!distribution || !distribution.percentiles) {
    throw new Error('Invalid distribution data');
  }

  const percentiles = [
    [0, 0],
    [10, distribution.percentiles.p10],
    [25, distribution.percentiles.p25],
    [50, distribution.percentiles.p50],
    [75, distribution.percentiles.p75],
    [90, distribution.percentiles.p90],
    [95, distribution.percentiles.p95],
    [99, distribution.percentiles.p99],
    [100, 300000] // Approximate upper bound
  ];

  // Handle edge case: income at or below 10th percentile
  if (income <= percentiles[1][1]) {
    return Math.max(0, (income / percentiles[1][1]) * 10);
  }

  // Handle edge case: income above 99th percentile
  if (income >= percentiles[percentiles.length - 2][1]) {
    return Math.min(99.9, 99 + (income - percentiles[percentiles.length - 2][1]) / percentiles[percentiles.length - 2][1]);
  }

  // Find bracketing percentiles and interpolate
  for (let i = 1; i < percentiles.length - 1; i++) {
    const [pLow, incomeLow] = percentiles[i];
    const [pHigh, incomeHigh] = percentiles[i + 1];

    if (income >= incomeLow && income <= incomeHigh) {
      const ratio = (income - incomeLow) / (incomeHigh - incomeLow);
      return pLow + ratio * (pHigh - pLow);
    }
  }

  return 50; // Default to median if calculation fails
}

/**
 * Get income bracket label based on percentile
 */
export function getIncomeBracket(percentile) {
  if (percentile >= 99) return 'Top 1%';
  if (percentile >= 95) return 'Top 5%';
  if (percentile >= 90) return 'Top 10%';
  if (percentile >= 75) return 'Top 25%';
  if (percentile >= 50) return 'Above Median';
  if (percentile >= 25) return 'Below Median';
  return 'Bottom 25%';
}

/**
 * Get household income data
 */
export function getHouseholdData() {
  return dataStore.householdData;
}

/**
 * Calculate which quintile a household income falls into
 * Uses midpoints between quintile averages to determine boundaries
 */
export function calculateHouseholdQuintile(income) {
  if (!dataStore.householdData || !dataStore.householdData.quintiles) {
    throw new Error('Household data not loaded');
  }

  const quintiles = dataStore.householdData.quintiles;
  const averages = [
    quintiles.q1.average,
    quintiles.q2.average,
    quintiles.q3.average,
    quintiles.q4.average,
    quintiles.q5.average
  ];

  // Calculate midpoints between quintile averages
  const midpoints = [];
  for (let i = 0; i < averages.length - 1; i++) {
    midpoints.push((averages[i] + averages[i + 1]) / 2);
  }

  // Determine which quintile based on midpoints
  let quintileIndex = 0;
  for (let i = 0; i < midpoints.length; i++) {
    if (income < midpoints[i]) {
      quintileIndex = i;
      break;
    }
    quintileIndex = i + 1;
  }

  const quintileKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const key = quintileKeys[quintileIndex];

  return {
    quintile: quintileIndex + 1,
    label: quintiles[key].label,
    average: quintiles[key].average
  };
}

/**
 * Calculate percentile for household income based on quintiles
 * Uses linear interpolation between quintile averages
 */
export function calculateHouseholdPercentile(income) {
  const quintiles = dataStore.householdData.quintiles;
  const quintileInfo = calculateHouseholdQuintile(income);
  const quintileIndex = quintileInfo.quintile - 1;

  const averages = [
    quintiles.q1.average,
    quintiles.q2.average,
    quintiles.q3.average,
    quintiles.q4.average,
    quintiles.q5.average
  ];

  // Base percentile (middle of the quintile)
  const basePercentile = quintileIndex * 20 + 10;

  // For more accuracy, interpolate position within the quintile
  let percentile = basePercentile;

  if (quintileIndex === 0) {
    // First quintile: interpolate between 0 and Q1-Q2 midpoint
    const midpoint = (averages[0] + averages[1]) / 2;
    const position = income / midpoint;
    percentile = Math.min(20, position * 20);
  } else if (quintileIndex === 4) {
    // Last quintile: interpolate from Q4-Q5 midpoint onwards
    const midpoint = (averages[3] + averages[4]) / 2;
    if (income >= averages[4]) {
      percentile = 90 + Math.min(9.9, (income / averages[4] - 1) * 10);
    } else {
      const position = (income - midpoint) / (averages[4] - midpoint);
      percentile = 80 + position * 20;
    }
  } else {
    // Middle quintiles: interpolate between midpoints
    const lowerMidpoint = (averages[quintileIndex - 1] + averages[quintileIndex]) / 2;
    const upperMidpoint = (averages[quintileIndex] + averages[quintileIndex + 1]) / 2;
    const range = upperMidpoint - lowerMidpoint;
    const position = (income - lowerMidpoint) / range;
    percentile = (quintileIndex * 20) + (position * 20);
  }

  return Math.min(99.9, Math.max(0, percentile));
}

/**
 * Get household income bracket label based on quintile
 */
export function getHouseholdBracket(quintile) {
  const brackets = {
    1: 'First Quintile (Q1) - Bottom 20%',
    2: 'Second Quintile (Q2)',
    3: 'Third Quintile (Q3) - Middle 20%',
    4: 'Fourth Quintile (Q4)',
    5: 'Fifth Quintile (Q5) - Top 20%'
  };

  return brackets[quintile] || 'Unknown';
}

export default {
  loadAllData,
  getDistribution,
  getGeographies,
  getDemographics,
  calculatePercentile,
  getIncomeBracket,
  getHouseholdData,
  calculateHouseholdQuintile,
  calculateHouseholdPercentile,
  getHouseholdBracket
};
