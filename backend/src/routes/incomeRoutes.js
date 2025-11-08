import express from 'express';
import {
  getDistribution,
  calculatePercentile,
  getIncomeBracket,
  getHouseholdData,
  calculateHouseholdPercentile,
  calculateHouseholdQuintile,
  getHouseholdBracket
} from '../services/dataService.js';

const router = express.Router();

/**
 * Helper function to determine age demographic code from age
 */
function getAgeDemographic(age) {
  if (age >= 15 && age <= 19) return 'age-15-19';
  if (age >= 20 && age <= 24) return 'age-20-24';
  if (age >= 25 && age <= 29) return 'age-25-29';
  if (age >= 30 && age <= 34) return 'age-30-34';
  if (age >= 35 && age <= 39) return 'age-35-39';
  if (age >= 40 && age <= 44) return 'age-40-44';
  if (age >= 45 && age <= 49) return 'age-45-49';
  if (age >= 50 && age <= 54) return 'age-50-54';
  if (age >= 55 && age <= 59) return 'age-55-59';
  if (age >= 60 && age <= 64) return 'age-60-64';
  if (age >= 65) return 'age-65plus';
  return 'all';
}

/**
 * Helper function to get age group label
 */
function getAgeGroupLabel(age) {
  if (age >= 15 && age <= 19) return '15-19';
  if (age >= 20 && age <= 24) return '20-24';
  if (age >= 25 && age <= 29) return '25-29';
  if (age >= 30 && age <= 34) return '30-34';
  if (age >= 35 && age <= 39) return '35-39';
  if (age >= 40 && age <= 44) return '40-44';
  if (age >= 45 && age <= 49) return '45-49';
  if (age >= 50 && age <= 54) return '50-54';
  if (age >= 55 && age <= 59) return '55-59';
  if (age >= 60 && age <= 64) return '60-64';
  if (age >= 65) return '65+';
  return null;
}

/**
 * GET /api/income/percentile
 * Calculate percentile rank for a given income and age
 * 
 * Query params:
 *   - income (required): Annual employment income
 *   - age (required): User's age (15-100)
 */
router.get('/percentile', (req, res) => {
  try {
    const income = parseFloat(req.query.income);
    const age = parseInt(req.query.age);

    // Validate income
    if (isNaN(income) || income < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Income must be a positive number'
      });
    }

    // Validate age (required)
    if (!req.query.age || isNaN(age) || age < 15 || age > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Age is required and must be between 15 and 100'
      });
    }

    const demographic = getAgeDemographic(age);
    const geography = 'CA';

    // Get distribution data
    const distribution = getDistribution(geography, demographic);
    
    if (!distribution) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No data found for age group: ${demographic}`
      });
    }

    // Calculate percentile
    const percentile = calculatePercentile(income, distribution);
    const belowYou = Math.floor(percentile);
    const aboveYou = 100 - belowYou;
    const bracket = getIncomeBracket(percentile);

    // Calculate comparison to median
    const median = distribution.median;
    const diffFromMedian = income - median;
    const percentDiffFromMedian = ((diffFromMedian / median) * 100).toFixed(1);

    // Calculate comparison to average
    const average = distribution.average;
    const diffFromAverage = income - average;
    const percentDiffFromAverage = ((diffFromAverage / average) * 100).toFixed(1);

    // Estimate number of people below
    const estimatedPeopleBelowYou = Math.floor((belowYou / 100) * distribution.totalRecipients);

    res.json({
      income,
      age,
      ageGroup: getAgeGroupLabel(age),
      geography: distribution.geography,
      demographic: distribution.demographicLabel,
      year: distribution.year,
      percentile: Math.round(percentile * 10) / 10,
      belowYou,
      aboveYou,
      bracket,
      median: {
        value: median,
        difference: Math.round(diffFromMedian),
        percentDifference: parseFloat(percentDiffFromMedian)
      },
      average: {
        value: average,
        difference: Math.round(diffFromAverage),
        percentDifference: parseFloat(percentDiffFromAverage)
      },
      estimatedPeopleBelowYou,
      totalRecipients: distribution.totalRecipients
    });

  } catch (error) {
    console.error('Error calculating percentile:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to calculate percentile'
    });
  }
});

/**
 * GET /api/income/distribution
 * Get income distribution data for an age group
 * 
 * Query params:
 *   - age (required): User's age to determine age group
 */
router.get('/distribution', (req, res) => {
  try {
    const age = parseInt(req.query.age);
    
    if (!req.query.age || isNaN(age) || age < 15 || age > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Age is required and must be between 15 and 100'
      });
    }

    const demographic = getAgeDemographic(age);
    const geography = 'CA';
    const distribution = getDistribution(geography, demographic);
    
    if (!distribution) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No data found for age group`
      });
    }

    res.json(distribution);

  } catch (error) {
    console.error('Error fetching distribution:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch distribution data'
    });
  }
});

/**
 * GET /api/income/household-percentile
 * Calculate percentile rank for household income
 *
 * Query params:
 *   - income (required): Annual household income
 */
router.get('/household-percentile', (req, res) => {
  try {
    const income = parseFloat(req.query.income);

    // Validate income
    if (isNaN(income) || income < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Income must be a positive number'
      });
    }

    const householdData = getHouseholdData();

    if (!householdData) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Household income data not available'
      });
    }

    // Calculate quintile and percentile
    const quintileInfo = calculateHouseholdQuintile(income);
    const percentile = calculateHouseholdPercentile(income);
    const belowYou = Math.floor(percentile);
    const aboveYou = 100 - belowYou;
    const bracket = getHouseholdBracket(quintileInfo.quintile);

    // Calculate comparison to median
    const median = householdData.median;
    const diffFromMedian = income - median;
    const percentDiffFromMedian = median !== 0 ? ((diffFromMedian / median) * 100).toFixed(1) : 0;

    // Calculate comparison to average
    const average = householdData.average;
    const diffFromAverage = income - average;
    const percentDiffFromAverage = average !== 0 ? ((diffFromAverage / average) * 100).toFixed(1) : 0;

    // Estimate number of households below
    const estimatedHouseholdsBelowYou = Math.floor((belowYou / 100) * householdData.totalHouseholds);

    res.json({
      income,
      geography: householdData.geography,
      year: householdData.year,
      quintile: quintileInfo.quintile,
      quintileLabel: quintileInfo.label,
      percentile: Math.round(percentile * 10) / 10,
      belowYou,
      aboveYou,
      bracket,
      median: {
        value: median,
        difference: Math.round(diffFromMedian),
        percentDifference: parseFloat(percentDiffFromMedian)
      },
      average: {
        value: average,
        difference: Math.round(diffFromAverage),
        percentDifference: parseFloat(percentDiffFromAverage)
      },
      estimatedHouseholdsBelowYou,
      totalHouseholds: householdData.totalHouseholds
    });

  } catch (error) {
    console.error('Error calculating household percentile:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to calculate household percentile'
    });
  }
});

/**
 * GET /api/income/household-distribution
 * Get household income distribution data
 */
router.get('/household-distribution', (req, res) => {
  try {
    const householdData = getHouseholdData();

    if (!householdData) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Household income data not available'
      });
    }

    res.json(householdData);

  } catch (error) {
    console.error('Error fetching household distribution:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch household distribution data'
    });
  }
});

export default router;
