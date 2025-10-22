import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store
const dataStore = {
  distributions: new Map(),
  geographies: [],
  demographics: []
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

    // Load default Canada data
    loadDefaultData();

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

      // Store data by geography code and demographic
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
    // Ensure we have at least default data
    loadDefaultData();
  }
}

/**
 * Load default Canada-wide data if no files exist
 */
function loadDefaultData() {
  const defaultData = {
    geography: 'Canada',
    geographyCode: 'CA',
    geographyType: 'country',
    year: 2020,
    demographic: 'all',
    demographicLabel: 'All persons',
    percentiles: {
      p10: 5200,
      p25: 16900,
      p50: 37358,
      p75: 67800,
      p90: 102000,
      p95: 129700,
      p96: 137600,
      p97: 149300,
      p98: 168500,
      p99: 216200
    },
    median: 37358,
    average: 53939,
    totalRecipients: 27000000
  };

  dataStore.distributions.set('CA-all', defaultData);
  
  if (!dataStore.geographies.find(g => g.code === 'CA')) {
    dataStore.geographies.push({
      code: 'CA',
      name: 'Canada',
      type: 'country'
    });
  }

  console.log('✓ Default Canada data loaded');
}

/**
 * Get distribution data for a specific geography and demographic
 */
export function getDistribution(geographyCode = 'CA', demographic = 'all') {
  const key = `${geographyCode}-${demographic}`;
  const data = dataStore.distributions.get(key);
  
  if (!data) {
    // Fall back to 'all' demographic if specific demographic not found
    const fallbackKey = `${geographyCode}-all`;
    return dataStore.distributions.get(fallbackKey);
  }
  
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

export default {
  loadAllData,
  getDistribution,
  getGeographies,
  getDemographics,
  calculatePercentile,
  getIncomeBracket
};
