/**
 * DIVIDEND DISCOUNT MODEL (DDM) ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 35 & Section 17 (Prompt)
 */

import { DdmResult } from '../types';
import { validateKeAndGrowth } from '../validation/validation';

/**
 * Calculates fair stock value using Gordon Growth Dividend Discount Model.
 * Formula:
 * D1 = D0 * (1 + g)
 * Value = D1 / (Ke - g)
 *
 * @param currentDividend - Current annual dividend per share (D0)
 * @param dividendGrowthRate - Perpetual dividend growth rate g as decimal (e.g. 0.05 for 5%)
 * @param costOfEquity - Required rate of return Ke as decimal (e.g. 0.10 for 10%)
 */
export function calculateDdmValuation(
  currentDividend: number,
  dividendGrowthRate: number,
  costOfEquity: number
): DdmResult {
  const val = validateKeAndGrowth(costOfEquity, dividendGrowthRate);
  if (!val.isValid) {
    throw new Error(val.errors[0]?.message || 'Invalid DDM parameters.');
  }

  if (currentDividend < 0) throw new Error('Current dividend cannot be negative.');

  const d1 = currentDividend * (1 + dividendGrowthRate);
  const fairValue = d1 / (costOfEquity - dividendGrowthRate);

  return {
    currentDividend,
    growthRate: dividendGrowthRate,
    costOfEquity,
    d1,
    fairValue,
  };
}
