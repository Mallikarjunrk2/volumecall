/**
 * PRESENT VALUE ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 4 & Section 19
 */

import { PresentValueResult } from '../types';

/**
 * Calculates present value required for a target future value.
 * Formula: PV = FV / (1 + r)^n
 *
 * @param futureValue - Target future amount (FV)
 * @param ratePerPeriod - Rate per discounting period as decimal
 * @param totalPeriods - Total number of periods (n)
 * @param annualRate - Optional annual rate for metadata
 * @param years - Optional years for metadata
 */
export function calculatePresentValue(
  futureValue: number,
  ratePerPeriod: number,
  totalPeriods: number,
  annualRate?: number,
  years?: number
): PresentValueResult {
  if (futureValue < 0) throw new Error('Future value cannot be negative.');
  if (totalPeriods < 0) throw new Error('Total periods cannot be negative.');

  const denominator = Math.pow(1 + ratePerPeriod, totalPeriods);
  if (denominator === 0) throw new Error('Denominator cannot be zero.');

  const presentValue = futureValue / denominator;
  const discountAmount = futureValue - presentValue;

  return {
    futureValue,
    presentValue,
    discountAmount,
    annualRate: annualRate ?? ratePerPeriod,
    years: years ?? totalPeriods,
  };
}
