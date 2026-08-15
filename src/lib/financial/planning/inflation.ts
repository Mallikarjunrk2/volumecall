/**
 * INFLATION & REAL RETURN ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 10 & Section 11 & Section 15 (Prompt)
 */

import { InflationResult, RealReturnResult } from '../types';

/**
 * Calculates future cost of a goal adjusted for inflation.
 * Formula: FV = PV * (1 + i)^n
 *
 * @param presentValue - Today's cost (PV)
 * @param inflationRate - Annual inflation rate as decimal (e.g. 0.06 for 6%)
 * @param years - Number of years in future (n)
 */
export function calculateFutureCost(
  presentValue: number,
  inflationRate: number,
  years: number
): InflationResult {
  if (presentValue < 0) throw new Error('Present value cannot be negative.');
  if (years < 0) throw new Error('Years cannot be negative.');

  const futureValue = presentValue * Math.pow(1 + inflationRate, years);

  return {
    presentValue,
    futureValue,
    inflationRate,
    years,
  };
}

/**
 * Calculates inflation-discounted present value (purchasing power).
 * Formula: PV = FV / (1 + i)^n
 */
export function calculateInflationPresentValue(
  futureValue: number,
  inflationRate: number,
  years: number
): InflationResult {
  if (futureValue < 0) throw new Error('Future value cannot be negative.');
  if (years < 0) throw new Error('Years cannot be negative.');

  const presentValue = futureValue / Math.pow(1 + inflationRate, years);

  return {
    presentValue,
    futureValue,
    inflationRate,
    years,
  };
}

/**
 * Calculates exact Fisher Real Return.
 * Formula: RealReturn = (1 + NominalReturn) / (1 + Inflation) - 1
 *
 * Section 11 & Prompt 15:
 * DO NOT use NominalReturn - Inflation as the exact calculation.
 */
export function calculateRealReturn(
  nominalReturn: number,
  inflationRate: number
): RealReturnResult {
  if (inflationRate <= -1) throw new Error('Inflation rate cannot be -100% or lower.');

  const realReturn = (1 + nominalReturn) / (1 + inflationRate) - 1;

  return {
    nominalReturn,
    inflationRate,
    realReturn,
  };
}
