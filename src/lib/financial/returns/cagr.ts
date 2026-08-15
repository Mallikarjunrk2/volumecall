/**
 * CAGR ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 6 & Section 10
 */

import { CagrResult } from '../types';

/**
 * Calculates Compound Annual Growth Rate (CAGR).
 * Formula: CAGR = (FV / PV)^(1 / t) - 1
 *
 * Requirements:
 * - One initial investment (PV)
 * - One final value (FV)
 * - Time in years (t > 0)
 *
 * @param initialValue - Present Value (PV)
 * @param finalValue - Future Value (FV)
 * @param years - Time in years (t)
 */
export function calculateCagr(
  initialValue: number,
  finalValue: number,
  years: number
): CagrResult {
  if (initialValue <= 0) throw new Error('Initial value must be greater than zero for CAGR calculation.');
  if (finalValue < 0) throw new Error('Final value cannot be negative for CAGR calculation.');
  if (years <= 0) throw new Error('Time in years must be greater than zero for CAGR calculation.');

  const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1;

  return {
    initialValue,
    finalValue,
    years,
    cagr,
  };
}
