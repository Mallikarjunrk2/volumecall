/**
 * XIRR ENGINE (Irregular Dates)
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 5 & Section 9 & Section 41
 */

import { CashFlow, XirrResult } from '../types';
import { calculateDayFraction365 } from '../cashflow/dates';
import { validateCashFlowsForXirr } from '../validation/validation';

/**
 * Calculates Net Present Value for XIRR given candidate rate r.
 * Formula: SUM( CF_i / (1 + r)^t_i ) where t_i = (date_i - date_0) / 365
 */
export function calculateXnpv(rate: number, cashFlows: CashFlow[]): number {
  if (cashFlows.length === 0) return 0;
  const d0 = cashFlows[0].date;
  let xnpv = 0;

  for (let i = 0; i < cashFlows.length; i++) {
    const cf = cashFlows[i];
    const t = calculateDayFraction365(d0, cf.date);
    const denominator = Math.pow(1 + rate, t);
    if (denominator === 0 || isNaN(denominator)) continue;
    xnpv += cf.amount / denominator;
  }

  return xnpv;
}

/**
 * Derivative of XNPV with respect to r (for Newton-Raphson fallback).
 * Formula: d/dr [ SUM( CF_i * (1+r)^(-t_i) ) ] = SUM( -t_i * CF_i * (1+r)^(-t_i - 1) )
 */
export function calculateXnpvDerivative(rate: number, cashFlows: CashFlow[]): number {
  if (cashFlows.length === 0) return 0;
  const d0 = cashFlows[0].date;
  let deriv = 0;

  for (let i = 0; i < cashFlows.length; i++) {
    const cf = cashFlows[i];
    const t = calculateDayFraction365(d0, cf.date);
    if (t === 0) continue;
    const denominator = Math.pow(1 + rate, t + 1);
    if (denominator === 0 || isNaN(denominator)) continue;
    deriv += (-t * cf.amount) / denominator;
  }

  return deriv;
}

/**
 * Calculates Extended Internal Rate of Return (XIRR) using Brent's Method with Newton-Raphson fallback.
 * Solves: SUM( CF_i / (1 + r)^((date_i - date_0) / 365) ) = 0
 *
 * @param cashFlows - Array of cash flows containing date and amount (negative for investment, positive for payout)
 * @param guess - Initial rate guess (default 0.10)
 * @param maxIterations - Maximum iterations allowed (default 100)
 * @param tolerance - Numerical convergence tolerance (default 1e-7)
 */
export function calculateXirr(
  cashFlows: CashFlow[],
  guess: number = 0.1,
  maxIterations: number = 100,
  tolerance: number = 1e-7
): XirrResult {
  const validation = validateCashFlowsForXirr(cashFlows);
  if (!validation.isValid) {
    return {
      success: false,
      xirr: null,
      iterations: 0,
      error: validation.errors[0]?.message || 'Invalid cash flows for XIRR.',
    };
  }

  // Sort cash flows chronologically
  const sorted = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());

  // First try Newton-Raphson starting at guess
  let nrRate = guess;
  let nrIter = 0;
  let nrSuccess = false;

  while (nrIter < 30) {
    nrIter++;
    const fVal = calculateXnpv(nrRate, sorted);
    if (Math.abs(fVal) < tolerance) {
      nrSuccess = true;
      break;
    }
    const fDeriv = calculateXnpvDerivative(nrRate, sorted);
    if (Math.abs(fDeriv) < 1e-12) break; // flat derivative

    const nextRate = nrRate - fVal / fDeriv;
    if (nextRate <= -0.999 || nextRate > 100 || isNaN(nextRate)) break; // out of bounds

    if (Math.abs(nextRate - nrRate) < tolerance) {
      nrRate = nextRate;
      nrSuccess = true;
      break;
    }
    nrRate = nextRate;
  }

  if (nrSuccess && !isNaN(nrRate) && isFinite(nrRate)) {
    return { success: true, xirr: nrRate, iterations: nrIter };
  }

  // If Newton-Raphson fails, use robust Brent's method
  let a = -0.999;
  let b = 10.0; // 1000% upper bound

  let fa = calculateXnpv(a, sorted);
  let fb = calculateXnpv(b, sorted);

  // Search bracket if initial endpoints do not bracket zero
  if (fa * fb > 0) {
    const step = 0.1;
    let foundBracket = false;
    for (let i = 1; i <= 100; i++) {
      const testA = Math.max(-0.99, guess - step * i);
      const testB = guess + step * i;
      const fTestA = calculateXnpv(testA, sorted);
      const fTestB = calculateXnpv(testB, sorted);
      if (fTestA * fTestB <= 0) {
        a = testA;
        b = testB;
        fa = fTestA;
        fb = fTestB;
        foundBracket = true;
        break;
      }
    }

    if (!foundBracket) {
      return {
        success: false,
        xirr: null,
        iterations: nrIter,
        error: 'Unable to bracket XIRR root.',
      };
    }
  }

  if (Math.abs(fa) < Math.abs(fb)) {
    let temp = a; a = b; b = temp;
    temp = fa; fa = fb; fb = temp;
  }

  let c = a;
  let fc = fa;
  let d = b - a;

  let iter = nrIter;
  while (iter < maxIterations) {
    iter++;

    if (Math.abs(fb) < tolerance) {
      return { success: true, xirr: b, iterations: iter };
    }

    if (fa !== fc && fb !== fc) {
      const s = (a * fb * fc) / ((fa - fb) * (fa - fc))
              + (b * fa * fc) / ((fb - fa) * (fb - fc))
              + (c * fa * fb) / ((fc - fa) * (fc - fb));
      if (s > (3 * a + b) / 4 && s < b) {
        d = s - b;
      } else {
        d = (a - b) / 2;
      }
    } else {
      d = (a - b) / 2;
    }

    c = b;
    fc = fb;

    if (Math.abs(d) > tolerance) {
      b += d;
    } else {
      b += (b - a > 0 ? tolerance : -tolerance);
    }

    fb = calculateXnpv(b, sorted);

    if ((fb > 0 && fc > 0) || (fb < 0 && fc < 0)) {
      a = c;
      fa = fc;
      d = b - a;
    }

    if (Math.abs(fa) < Math.abs(fb)) {
      let temp = a; a = b; b = temp;
      temp = fa; fa = fb; fb = temp;
    }
  }

  return { success: true, xirr: b, iterations: iter };
}
