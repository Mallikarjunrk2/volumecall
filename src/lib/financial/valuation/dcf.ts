/**
 * DISCOUNTED CASH FLOW (DCF) VALUATION ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 31 & Section 17 (Prompt)
 */

import { DcfResult } from '../types';
import { validateWaccAndGrowth } from '../validation/validation';

/**
 * Calculates Enterprise Value and Equity Value using Discounted Cash Flow model.
 *
 * @param forecastedFcfs - Array of projected Free Cash Flows for t=1..n
 * @param wacc - Weighted Average Cost of Capital as decimal (e.g. 0.10 for 10%)
 * @param terminalGrowthRate - Long-term perpetual growth rate g as decimal (e.g. 0.03 for 3%)
 * @param netDebt - Total Debt minus Cash & Equivalents (default 0)
 * @param dilutedShares - Total diluted shares outstanding (optional)
 */
export function calculateDcf(
  forecastedFcfs: number[],
  wacc: number,
  terminalGrowthRate: number,
  netDebt: number = 0,
  dilutedShares?: number
): DcfResult {
  const val = validateWaccAndGrowth(wacc, terminalGrowthRate);
  if (!val.isValid) {
    throw new Error(val.errors[0]?.message || 'Invalid DCF parameters.');
  }

  if (!Array.isArray(forecastedFcfs) || forecastedFcfs.length === 0) {
    throw new Error('DCF requires at least one forecasted cash flow.');
  }

  const n = forecastedFcfs.length;
  let pvForecastFcf = 0;
  const pvFcfs: number[] = [];

  for (let t = 1; t <= n; t++) {
    const fcf = forecastedFcfs[t - 1];
    const pv = fcf / Math.pow(1 + wacc, t);
    pvFcfs.push(pv);
    pvForecastFcf += pv;
  }

  const lastFcf = forecastedFcfs[n - 1];
  const nextFcf = lastFcf * (1 + terminalGrowthRate);
  const terminalValue = nextFcf / (wacc - terminalGrowthRate);
  const pvTerminalValue = terminalValue / Math.pow(1 + wacc, n);

  const enterpriseValue = pvForecastFcf + pvTerminalValue;
  const equityValue = enterpriseValue - netDebt;

  let fairValuePerShare: number | undefined;
  if (dilutedShares && dilutedShares > 0) {
    fairValuePerShare = equityValue / dilutedShares;
  }

  return {
    enterpriseValue,
    equityValue,
    fairValuePerShare,
    pvForecastFcf,
    terminalValue,
    pvTerminalValue,
    forecastedFcfs,
    pvFcfs,
  };
}
