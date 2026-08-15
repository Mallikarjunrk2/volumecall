/**
 * EV / EBITDA VALUATION ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 34 & Section 17 (Prompt)
 */

import { EvEbitdaResult } from '../types';

/**
 * Calculates Enterprise Value and Equity Value based on EV/EBITDA multiple.
 * Formula:
 * EV = EBITDA * Multiple
 * EquityValue = EV - NetDebt
 * FairValuePerShare = EquityValue / DilutedShares
 *
 * @param ebitda - Earnings Before Interest, Tax, Depreciation & Amortization
 * @param multiple - Target EV/EBITDA multiple
 * @param netDebt - Total Debt minus Cash & Cash Equivalents (default 0)
 * @param dilutedShares - Total diluted shares outstanding (optional)
 */
export function calculateEvEbitdaValuation(
  ebitda: number,
  multiple: number,
  netDebt: number = 0,
  dilutedShares?: number
): EvEbitdaResult {
  if (ebitda < 0) throw new Error('EBITDA cannot be negative.');
  if (multiple < 0) throw new Error('Multiple cannot be negative.');

  const enterpriseValue = ebitda * multiple;
  const equityValue = enterpriseValue - netDebt;

  let fairValuePerShare: number | undefined;
  if (dilutedShares && dilutedShares > 0) {
    fairValuePerShare = equityValue / dilutedShares;
  }

  return {
    ebitda,
    multiple,
    enterpriseValue,
    netDebt,
    equityValue,
    dilutedShares,
    fairValuePerShare,
  };
}
