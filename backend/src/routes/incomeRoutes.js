import express from 'express';
import { 
  getDistribution, 
  calculatePercentile,
  getIncomeBracket
} from '../services/dataService.js';

const router = express.Router();

/**
 * Helper function to determine age demographic code from age
 */
function getAgeDemographic(age) {
  if (age >= 15 && age <= 24) return 'age-15-24';
  if (age >= 25 && age <= 34) return 'age-25-34';
  if (age >= 35 && age <= 44) return 'age-35-44';
  if (age >= 45 && age <= 54) return 'age-45-54';
  if (age >= 55 && age <= 64) return 'age-55-64';
  if (age >= 65) return 'age-65plus';
  return 'all';
}

/**
 * Helper function to get age group label
 */
function getAgeGroupLabel(age) {
  if (age >= 15 && age <= 24) return '15-24';
  if (age >= 25 && age <= 34) return '25-34';
  if (age >= 35 && age <= 44) return '35-44';
  if (age >= 45 && age <= 54) return '45-54';
  if (age >= 55 && age <= 64) return '55-64';
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

export default router;
