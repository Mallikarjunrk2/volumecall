/**
 * REVERSE DCF ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 36 & Section 17 (Prompt)
 */

import { ReverseDcfResult } from '../types';
import { calculateDcf } from './dcf';

/**
 * Calculates the implied constant FCF forecast growth rate `g` required to justify target equity value / market price.
 *
 * @param baseFcf - Baseline Free Cash Flow (t=0)
 * @param targetEquityValue - Current market cap / target equity value
 * @param wacc - Weighted Average Cost of Capital as decimal
 * @param forecastYears - Number of forecast years (default 5)
 * @param terminalGrowthRate - Perpetual terminal growth rate as decimal (default 0.03)
 * @param netDebt - Net debt (default 0)
 * @param maxIterations - Maximum solver iterations (default 100)
 * @param tolerance - Error tolerance (default 1e-4)
 */
export function calculateReverseDcf(
  baseFcf: number,
  targetEquityValue: number,
  wacc: number,
  forecastYears: number = 5,
  terminalGrowthRate: number = 0.03,
  netDebt: number = 0,
  maxIterations: number = 100,
  tolerance: number = 1e-4
): ReverseDcfResult {
  if (baseFcf <= 0) throw new Error('Base FCF must be greater than zero for Reverse DCF.');
  if (targetEquityValue <= 0) throw new Error('Target equity value must be greater than zero.');

  const getEquityValForGrowth = (growth: number): number => {
    const fcfs: number[] = [];
    let currentFcf = baseFcf;
    for (let t = 1; t <= forecastYears; t++) {
      currentFcf *= (1 + growth);
      fcfs.push(currentFcf);
    }
    const dcfRes = calculateDcf(fcfs, wacc, terminalGrowthRate, netDebt);
    return dcfRes.equityValue;
  };

  const evalDiff = (g: number) => getEquityValForGrowth(g) - targetEquityValue;

  // Secant / Newton-Raphson solver starting at guess 10%
  let gCurrent = 0.10;
  let impliedGrowthRate: number | null = null;
  let calculatedEquityValue = 0;
  let iter = 0;

  for (let i = 0; i < maxIterations; i++) {
    iter++;
    const diff = evalDiff(gCurrent);
    if (Math.abs(diff) < tolerance) {
      impliedGrowthRate = gCurrent;
      calculatedEquityValue = getEquityValForGrowth(gCurrent);
      break;
    }

    const delta = 1e-5;
    const deriv = (evalDiff(gCurrent + delta) - evalDiff(gCurrent - delta)) / (2 * delta);

    if (Math.abs(deriv) < 1e-12) break;

    const nextG = gCurrent - diff / deriv;
    if (nextG <= -0.95 || nextG > 10.0 || isNaN(nextG)) break;

    if (Math.abs(nextG - gCurrent) < 1e-7) {
      impliedGrowthRate = nextG;
      calculatedEquityValue = getEquityValForGrowth(nextG);
      break;
    }
    gCurrent = nextG;
  }

  // Bisection fallback if Secant did not converge
  if (impliedGrowthRate === null) {
    let a = -0.50;
    let b = 5.0; // 500% growth upper bound for 5-yr forecast
    let fa = evalDiff(a);
    let fb = evalDiff(b);

    if (fa * fb <= 0) {
      for (let k = 0; k < maxIterations; k++) {
        iter++;
        const mid = (a + b) / 2;
        const fMid = evalDiff(mid);

        if (Math.abs(fMid) < tolerance || Math.abs(b - a) < 1e-7) {
          impliedGrowthRate = mid;
          calculatedEquityValue = getEquityValForGrowth(mid);
          break;
        }

        if (fa * fMid < 0) {
          b = mid;
          fb = fMid;
        } else {
          a = mid;
          fa = fMid;
        }
      }
    }
  }

  return {
    impliedGrowthRate,
    currentPrice: targetEquityValue,
    calculatedEquityValue: calculatedEquityValue || getEquityValForGrowth(impliedGrowthRate ?? 0),
    iterations: iter,
  };
}
