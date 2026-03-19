import connectDB from './mongodb';
import ATMReview from '../models/ATMReview';

export type ATMStatusFlag = 'green' | 'orange' | 'red';

interface ATMStatusResult {
  atmId: string;
  statusFlag: ATMStatusFlag;
}

/**
 * Calculate ATM status flags based on reviews from the last 48 hours
 * Uses optimized MongoDB aggregation pipeline
 * 
 * Rules:
 * - RED: cashAvailable=false OR more 'not_working' than 'working' reviews
 * - ORANGE: Any non-working status exists (partially_working, accepting_own_bank, not_working)
 * - GREEN: Default (no reviews or all working)
 */
export async function getATMStatusFlags(atmIds: string[]): Promise<Map<string, ATMStatusFlag>> {
  if (atmIds.length === 0) {
    return new Map();
  }

  try {
    await connectDB();

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Optimized aggregation pipeline using the compound index (atmId, createdAt)
    const results = await ATMReview.aggregate([
      {
        // Match reviews for given ATM IDs within 48 hours
        $match: {
          atmId: { $in: atmIds },
          createdAt: { $gte: fortyEightHoursAgo }
        }
      },
      {
        // Group by atmId and calculate statistics
        $group: {
          _id: '$atmId',
          hasNoCash: { $max: { $cond: [{ $eq: ['$cashAvailable', false] }, 1, 0] } },
          workingCount: {
            $sum: { $cond: [{ $eq: ['$workingStatus', 'working'] }, 1, 0] }
          },
          notWorkingCount: {
            $sum: { $cond: [{ $eq: ['$workingStatus', 'not_working'] }, 1, 0] }
          },
          hasIssues: {
            $max: {
              $cond: [
                {
                  $in: ['$workingStatus', ['not_working', 'partially_working', 'accepting_own_bank']]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        // Project the final status flag
        $project: {
          atmId: '$_id',
          statusFlag: {
            $cond: [
              // RED condition: no cash OR more not_working than working
              {
                $or: [
                  { $eq: ['$hasNoCash', 1] },
                  { $gt: ['$notWorkingCount', '$workingCount'] }
                ]
              },
              'red',
              {
                // ORANGE condition: has any issues
                $cond: [
                  { $eq: ['$hasIssues', 1] },
                  'orange',
                  'green' // GREEN: all good
                ]
              }
            ]
          }
        }
      }
    ]);

    // Convert results to Map for O(1) lookup
    const statusMap = new Map<string, ATMStatusFlag>();
    results.forEach((result: ATMStatusResult) => {
      statusMap.set(result.atmId, result.statusFlag);
    });

    return statusMap;
  } catch (error) {
    console.error('Error calculating ATM status flags:', error);
    // Return empty map on error - ATMs will show default color
    return new Map();
  }
}
