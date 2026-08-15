/**
 * COMPOUND INTEREST ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 2 & Section 4
 */

import { CompoundingFrequency, CompoundInterestResult } from '../types';
import { periodsPerYearFromFrequency } from '../rates/rateConversion';

/**
 * Calculates compound interest maturity amount and interest earned.
 * Formula: A = P * (1 + r/n)^(n*t)
 * Interest = A - P
 *
 * @param principal - Initial principal amount (P)
 * @param annualRate - Annual nominal interest rate as decimal (e.g. 0.10 for 10%)
 * @param years - Time in years (t)
 * @param frequency - Compounding frequency n (default 'annual')
 */
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  frequency: CompoundingFrequency = 'annual'
): CompoundInterestResult {
  if (principal < 0) throw new Error('Principal cannot be negative.');
  if (years < 0) throw new Error('Years cannot be negative.');

  const n = periodsPerYearFromFrequency(frequency);
  const totalPeriods = n * years;
  const periodicRate = annualRate / n;

  const totalAmount = principal * Math.pow(1 + periodicRate, totalPeriods);
  const interest = totalAmount - principal;

  return {
    principal,
    interest,
    totalAmount,
    annualRate,
    compoundingPeriodsPerYear: n,
    years,
  };
}
