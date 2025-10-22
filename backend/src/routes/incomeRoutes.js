import express from 'express';
import { 
  getDistribution, 
  getGeographies, 
  getDemographics,
  calculatePercentile,
  getIncomeBracket
} from '../services/dataService.js';

const router = express.Router();

/**
 * GET /api/income/percentile
 * Calculate percentile rank for a given income
 * 
 * Query params:
 *   - income (required): Annual employment income
 *   - geography (optional): Geography code (default: CA)
 *   - demographic (optional): Demographic filter (default: all)
 */
router.get('/percentile', (req, res) => {
  try {
    const income = parseFloat(req.query.income);
    const geography = req.query.geography || 'CA';
    const demographic = req.query.demographic || 'all';

    // Validate income
    if (isNaN(income) || income < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Income must be a positive number'
      });
    }

    // Get distribution data
    const distribution = getDistribution(geography, demographic);
    
    if (!distribution) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No data found for geography: ${geography}, demographic: ${demographic}`
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

    // Estimate number of people below (rough approximation)
    const estimatedPeopleBelowYou = Math.floor((belowYou / 100) * distribution.totalRecipients);

    res.json({
      income,
      geography: distribution.geography,
      geographyCode: distribution.geographyCode,
      demographic: distribution.demographicLabel || 'All persons',
      year: distribution.year,
      percentile: Math.round(percentile * 10) / 10, // Round to 1 decimal
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
 * Get income distribution data
 * 
 * Query params:
 *   - geography (optional): Geography code (default: CA)
 *   - demographic (optional): Demographic filter (default: all)
 */
router.get('/distribution', (req, res) => {
  try {
    const geography = req.query.geography || 'CA';
    const demographic = req.query.demographic || 'all';

    const distribution = getDistribution(geography, demographic);
    
    if (!distribution) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No data found for geography: ${geography}, demographic: ${demographic}`
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
 * GET /api/income/geographies
 * Get list of available geographies
 */
router.get('/geographies', (req, res) => {
  try {
    const geographies = getGeographies();
    res.json({
      count: geographies.length,
      geographies
    });
  } catch (error) {
    console.error('Error fetching geographies:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch geographies'
    });
  }
});

/**
 * GET /api/income/demographics
 * Get list of available demographic filters
 */
router.get('/demographics', (req, res) => {
  try {
    const demographics = getDemographics();
    res.json({
      count: demographics.length,
      demographics
    });
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch demographics'
    });
  }
});

export default router;
