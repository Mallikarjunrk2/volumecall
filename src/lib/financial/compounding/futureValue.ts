/**
 * FUTURE VALUE ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 4 & Section 18
 */

import { FutureValueResult } from '../types';

/**
 * Calculates future value of a lump-sum investment.
 * Formula: FV = PV * (1 + r)^n
 *
 * @param presentValue - Initial lump sum (PV)
 * @param ratePerPeriod - Rate per compounding period as decimal (e.g. 0.10 for 10% annual if n in years)
 * @param totalPeriods - Total number of compounding periods (n)
 * @param annualRate - Optional annual rate for result structure metadata
 * @param years - Optional years for result structure metadata
 */
export function calculateFutureValue(
  presentValue: number,
  ratePerPeriod: number,
  totalPeriods: number,
  annualRate?: number,
  years?: number
): FutureValueResult {
  if (presentValue < 0) throw new Error('Present value cannot be negative.');
  if (totalPeriods < 0) throw new Error('Total periods cannot be negative.');

  const futureValue = presentValue * Math.pow(1 + ratePerPeriod, totalPeriods);
  const totalGrowth = futureValue - presentValue;

  return {
    presentValue,
    futureValue,
    totalGrowth,
    annualRate: annualRate ?? ratePerPeriod,
    years: years ?? totalPeriods,
  };
}
