/**
 * RATE CONVERSION ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 3 & Section 37
 */

import { CompoundingFrequency } from '../types';

/**
 * Converts frequency string or numeric period to periods per year.
 */
export function periodsPerYearFromFrequency(frequency: CompoundingFrequency): number {
  if (typeof frequency === 'number') {
    if (frequency <= 0) throw new Error('Periods per year must be greater than zero.');
    return frequency;
  }
  switch (frequency) {
    case 'annual':
      return 1;
    case 'semi-annual':
      return 2;
    case 'quarterly':
      return 4;
    case 'monthly':
      return 12;
    case 'daily':
      return 365;
    default:
      throw new Error(`Unsupported compounding frequency: ${frequency}`);
  }
}

/**
 * Converts Effective Annual Rate (EAR) to Periodic Rate.
 * Formula: (1 + effectiveAnnualRate)^(1 / periodsPerYear) - 1
 * Section 3 & 37:
 * Monthly: (1 + r)^(1/12) - 1
 * Quarterly: (1 + r)^(1/4) - 1
 * Daily: (1 + r)^(1/365) - 1
 */
export function effectiveAnnualToPeriodic(
  effectiveAnnualRate: number,
  frequency: CompoundingFrequency
): number {
  const n = periodsPerYearFromFrequency(frequency);
  return Math.pow(1 + effectiveAnnualRate, 1 / n) - 1;
}

/**
 * Converts Nominal Annual Rate (NAR) to Periodic Rate.
 * Formula: nominalAnnualRate / periodsPerYear
 */
export function nominalAnnualToPeriodic(
  nominalAnnualRate: number,
  frequency: CompoundingFrequency
): number {
  const n = periodsPerYearFromFrequency(frequency);
  return nominalAnnualRate / n;
}

/**
 * Converts Periodic Rate to Effective Annual Rate (EAR).
 * Formula: (1 + periodicRate)^periodsPerYear - 1
 */
export function periodicToEffectiveAnnual(
  periodicRate: number,
  frequency: CompoundingFrequency
): number {
  const n = periodsPerYearFromFrequency(frequency);
  return Math.pow(1 + periodicRate, n) - 1;
}
