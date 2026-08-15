/**
 * P/E & PEG VALUATION ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 32 & Section 33 & Section 17 (Prompt)
 */

import { PeValuationResult, PegResult } from '../types';

/**
 * Calculates Fair Value based on Price-to-Earnings (P/E) multiple.
 * Formula: FairValue = ExpectedEPS * FairPE
 *
 * @param expectedEps - Expected Earnings Per Share
 * @param fairPe - Target / historical fair P/E ratio
 */
export function calculatePeValuation(
  expectedEps: number,
  fairPe: number
): PeValuationResult {
  const fairValue = expectedEps * fairPe;
  return {
    expectedEps,
    fairPe,
    fairValue,
  };
}

/**
 * Calculates Price/Earnings-to-Growth (PEG) ratio.
 * Formula: PEG = PE / EarningsGrowth
 *
 * Section 33:
 * Growth is accepted as either percentage number (e.g. 15 for 15%) or decimal (e.g. 0.15 for 15%).
 *
 * @param peRatio - Price to Earnings ratio
 * @param earningsGrowth - Earnings growth rate (e.g. 15 or 0.15 for 15%)
 * @param isDecimalGrowth - Set to true if growth is passed as 0.15 instead of 15 (default false)
 */
export function calculatePegRatio(
  peRatio: number,
  earningsGrowth: number,
  isDecimalGrowth: boolean = false
): PegResult {
  if (earningsGrowth === 0) throw new Error('Earnings growth cannot be zero in PEG calculation.');

  const growthPercentage = isDecimalGrowth ? earningsGrowth * 100 : earningsGrowth;
  const pegRatio = peRatio / growthPercentage;

  return {
    peRatio,
    growthRate: growthPercentage,
    pegRatio,
  };
}
