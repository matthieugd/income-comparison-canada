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
 */
export function calculateHouseholdQuintile(income) {
  if (!dataStore.householdData || !dataStore.householdData.quintiles) {
    throw new Error('Household data not loaded');
  }

  const quintiles = dataStore.householdData.quintiles;

  // Check each quintile
  const quintileKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];
  for (let i = 0; i < quintileKeys.length; i++) {
    const key = quintileKeys[i];
    const quintile = quintiles[key];

    if (income >= quintile.min && income < quintile.max) {
      return {
        quintile: i + 1,
        label: quintile.label,
        min: quintile.min,
        max: quintile.max
      };
    }
  }

  // If income is above Q5 max, return Q5
  return {
    quintile: 5,
    label: quintiles.q5.label,
    min: quintiles.q5.min,
    max: quintiles.q5.max
  };
}

/**
 * Calculate percentile for household income based on quintiles
 * Returns approximate percentile (quintiles divide into 20% chunks)
 */
export function calculateHouseholdPercentile(income) {
  const quintileInfo = calculateHouseholdQuintile(income);
  const quintile = quintileInfo.quintile;

  // Calculate position within quintile
  const quintileMin = quintileInfo.min;
  const quintileMax = quintileInfo.max;
  const range = quintileMax - quintileMin;

  // Avoid division by zero for the last quintile
  let positionInQuintile = 0.5;
  if (range > 0) {
    positionInQuintile = (income - quintileMin) / range;
  }

  // Each quintile represents 20% of households
  // Base percentile is the start of the quintile
  const basePercentile = (quintile - 1) * 20;

  // Add position within quintile (0-20 percentage points)
  const percentile = basePercentile + (positionInQuintile * 20);

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
