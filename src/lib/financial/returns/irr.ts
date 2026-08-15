/**
 * IRR ENGINE (Regular Periods)
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 28 & Section 12
 */

import { IrrResult } from '../types';

/**
 * Calculates Net Present Value (NPV) for a given discount rate and periodic cash flows.
 * Formula: NPV = SUM( CF_t / (1 + r)^t )
 */
export function calculateNpv(rate: number, cashFlows: number[]): number {
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const denominator = Math.pow(1 + rate, t);
    if (denominator === 0 || isNaN(denominator)) continue;
    npv += cashFlows[t] / denominator;
  }
  return npv;
}

/**
 * Calculates Derivative of NPV with respect to r.
 * d/dr NPV = SUM( -t * CF_t / (1 + r)^(t+1) )
 */
export function calculateNpvDerivative(rate: number, cashFlows: number[]): number {
  let deriv = 0;
  for (let t = 1; t < cashFlows.length; t++) {
    const denominator = Math.pow(1 + rate, t + 1);
    if (denominator === 0 || isNaN(denominator)) continue;
    deriv += (-t * cashFlows[t]) / denominator;
  }
  return deriv;
}

/**
 * Calculates Internal Rate of Return (IRR) for regular periodic cash flows.
 * Equation: SUM( CF_t / (1 + r)^t ) = 0
 *
 * @param cashFlows - Array of periodic amounts (must contain at least one positive and one negative cash flow)
 * @param guess - Initial rate guess (default 0.10)
 * @param maxIterations - Maximum iterations (default 100)
 * @param tolerance - Error tolerance (default 1e-7)
 */
export function calculateIrr(
  cashFlows: number[],
  guess: number = 0.1,
  maxIterations: number = 100,
  tolerance: number = 1e-7
): IrrResult {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) {
    return { success: false, irr: null, iterations: 0, error: 'IRR requires at least 2 cash flows.' };
  }

  let hasPositive = false;
  let hasNegative = false;
  for (const amount of cashFlows) {
    if (amount > 0) hasPositive = true;
    if (amount < 0) hasNegative = true;
  }

  if (!hasPositive || !hasNegative) {
    return {
      success: false,
      irr: null,
      iterations: 0,
      error: 'IRR requires at least one positive and one negative cash flow.',
    };
  }

  // First try Newton-Raphson starting at guess
  let r = guess;
  let iter = 0;

  for (let i = 0; i < 40; i++) {
    iter++;
    const npv = calculateNpv(r, cashFlows);
    if (Math.abs(npv) < tolerance) {
      return { success: true, irr: r, iterations: iter };
    }
    const deriv = calculateNpvDerivative(r, cashFlows);
    if (Math.abs(deriv) < 1e-12) break;

    const nextR = r - npv / deriv;
    if (nextR <= -0.99 || nextR > 50 || isNaN(nextR)) break;

    if (Math.abs(nextR - r) < tolerance) {
      return { success: true, irr: nextR, iterations: iter };
    }
    r = nextR;
  }

  // Bisection fallback between -0.90 and 10.0
  let a = -0.90;
  let b = 10.0;
  let fa = calculateNpv(a, cashFlows);
  let fb = calculateNpv(b, cashFlows);

  if (fa * fb > 0) {
    const step = 0.1;
    let found = false;
    for (let k = 1; k <= 50; k++) {
      const testA = Math.max(-0.90, guess - step * k);
      const testB = guess + step * k;
      const fA = calculateNpv(testA, cashFlows);
      const fB = calculateNpv(testB, cashFlows);
      if (fA * fB <= 0) {
        a = testA;
        b = testB;
        fa = fA;
        fb = fB;
        found = true;
        break;
      }
    }
    if (!found) {
      return { success: false, irr: null, iterations: iter, error: 'Could not bracket IRR root.' };
    }
  }

  for (let k = 0; k < maxIterations; k++) {
    iter++;
    const mid = (a + b) / 2;
    const fMid = calculateNpv(mid, cashFlows);

    if (Math.abs(fMid) < tolerance || Math.abs(b - a) < tolerance) {
      return { success: true, irr: mid, iterations: iter };
    }

    if (fa * fMid < 0) {
      b = mid;
      fb = fMid;
    } else {
      a = mid;
      fa = fMid;
    }
  }

  return { success: true, irr: (a + b) / 2, iterations: iter };
}
