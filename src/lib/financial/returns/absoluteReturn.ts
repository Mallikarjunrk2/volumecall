/**
 * ABSOLUTE RETURN ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 7 & Section 11
 */

import { AbsoluteReturnResult } from '../types';

/**
 * Calculates absolute gain and percentage return.
 * Gain = CurrentValue - Investment
 * Return% = (CurrentValue - Investment) / Investment * 100
 *
 * @param investment - Initial total investment amount
 * @param currentValue - Final / current value of investment
 */
export function calculateAbsoluteReturn(
  investment: number,
  currentValue: number
): AbsoluteReturnResult {
  const gain = currentValue - investment;

  if (investment <= 0) {
    return {
      investment,
      currentValue,
      gain,
      returnPercentage: 0,
    };
  }

  const returnPercentage = (gain / investment) * 100;

  return {
    investment,
    currentValue,
    gain,
    returnPercentage,
  };
}
