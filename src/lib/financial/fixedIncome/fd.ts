/**
 * FIXED DEPOSIT (FD) ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 12 & Section 13 & Section 16 (Prompt)
 */

import { CompoundingFrequency, FdResult } from '../types';
import { calculateCompoundInterest } from '../compounding/compoundInterest';
import { periodsPerYearFromFrequency } from '../rates/rateConversion';

/**
 * Calculates Fixed Deposit maturity value for Cumulative or Non-Cumulative FDs.
 * Generic Compound FD Formula: A = P * (1 + r/n)^(n*t)
 *
 * @param principal - Initial deposit amount (P)
 * @param annualRate - Nominal annual interest rate as decimal (e.g. 0.075 for 7.5%)
 * @param tenureYears - Deposit tenure in years (t)
 * @param frequency - Compounding frequency n (default 'quarterly' for standard Indian bank FDs)
 * @param isCumulative - true for Cumulative FD, false for Non-Cumulative simple interest payout (default true)
 */
export function calculateFd(
  principal: number,
  annualRate: number,
  tenureYears: number,
  frequency: CompoundingFrequency = 'quarterly',
  isCumulative: boolean = true
): FdResult {
  if (principal < 0) throw new Error('Principal cannot be negative.');
  if (tenureYears < 0) throw new Error('Tenure cannot be negative.');

  const n = periodsPerYearFromFrequency(frequency);

  if (isCumulative) {
    const res = calculateCompoundInterest(principal, annualRate, tenureYears, frequency);
    return {
      principal,
      maturityAmount: res.totalAmount,
      interestEarned: res.interest,
      tenureYears,
      annualRate,
      compoundingPeriodsPerYear: n,
      isCumulative: true,
    };
  } else {
    // Non-cumulative FD: simple annual/periodic interest payout
    const totalSimpleInterest = principal * annualRate * tenureYears;
    const periodicPayout = (principal * annualRate) / n;

    return {
      principal,
      maturityAmount: principal, // principal returned at maturity; interest paid out periodically
      interestEarned: totalSimpleInterest,
      tenureYears,
      annualRate,
      compoundingPeriodsPerYear: n,
      isCumulative: false,
      periodicPayout,
    };
  }
}
