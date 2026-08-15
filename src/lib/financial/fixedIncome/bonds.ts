/**
 * BOND PRICING & YTM ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 30
 */

import { BondResult } from '../types';

/**
 * Calculates bond price given face value, coupon rate, YTM, tenure, and coupon frequency.
 * Formula: Price = SUM( C / (1 + y/m)^(m*t) ) + FV / (1 + y/m)^(m*n)
 *
 * @param faceValue - Face / par value of bond (FV)
 * @param couponRate - Annual coupon rate as decimal (e.g. 0.08 for 8%)
 * @param ytm - Yield to maturity as decimal (e.g. 0.07 for 7%)
 * @param tenureYears - Time to maturity in years (n)
 * @param couponFrequency - Coupon payments per year (default 2 for semi-annual)
 */
export function calculateBondPrice(
  faceValue: number,
  couponRate: number,
  ytm: number,
  tenureYears: number,
  couponFrequency: number = 2
): number {
  if (faceValue <= 0) throw new Error('Face value must be positive.');
  if (tenureYears <= 0) throw new Error('Tenure years must be positive.');

  const totalPeriods = Math.round(tenureYears * couponFrequency);
  const couponPayment = (faceValue * couponRate) / couponFrequency;
  const periodicYtm = ytm / couponFrequency;

  let pvCoupons = 0;
  for (let t = 1; t <= totalPeriods; t++) {
    pvCoupons += couponPayment / Math.pow(1 + periodicYtm, t);
  }

  const pvFaceValue = faceValue / Math.pow(1 + periodicYtm, totalPeriods);
  return pvCoupons + pvFaceValue;
}

/**
 * Calculates Yield to Maturity (YTM) for a bond given current market price.
 * Solves: Price - [ SUM( C / (1 + y/m)^t ) + FV / (1 + y/m)^N ] = 0
 */
export function calculateBondYtm(
  faceValue: number,
  couponRate: number,
  marketPrice: number,
  tenureYears: number,
  couponFrequency: number = 2,
  guess: number = 0.08,
  tolerance: number = 1e-7,
  maxIterations: number = 100
): BondResult {
  if (marketPrice <= 0) throw new Error('Market price must be positive.');

  const priceDiff = (ytmTest: number) => calculateBondPrice(faceValue, couponRate, ytmTest, tenureYears, couponFrequency) - marketPrice;

  // 1. Try Newton-Raphson starting at guess
  let ytm: number | null = null;
  let currentYtm = guess;

  for (let iter = 0; iter < 30; iter++) {
    const diff = priceDiff(currentYtm);
    if (Math.abs(diff) < tolerance) {
      ytm = currentYtm;
      break;
    }
    // Numerical derivative dPrice/dYTM
    const delta = 1e-5;
    const deriv = (priceDiff(currentYtm + delta) - priceDiff(currentYtm - delta)) / (2 * delta);
    if (Math.abs(deriv) < 1e-12) break;

    const nextYtm = currentYtm - diff / deriv;
    if (nextYtm <= -0.99 || nextYtm > 5.0 || isNaN(nextYtm)) break;

    if (Math.abs(nextYtm - currentYtm) < tolerance) {
      ytm = nextYtm;
      break;
    }
    currentYtm = nextYtm;
  }

  // 2. Bisection fallback if Newton-Raphson didn't converge
  if (ytm === null) {
    let a = -0.5;
    let b = 2.0;
    let fa = priceDiff(a);
    let fb = priceDiff(b);

    if (fa * fb <= 0) {
      for (let iter = 0; iter < maxIterations; iter++) {
        const mid = (a + b) / 2;
        const fMid = priceDiff(mid);

        if (Math.abs(fMid) < tolerance || Math.abs(b - a) < tolerance) {
          ytm = mid;
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
    faceValue,
    couponRate,
    price: marketPrice,
    tenureYears,
    ytm,
    couponFrequency,
  };
}
