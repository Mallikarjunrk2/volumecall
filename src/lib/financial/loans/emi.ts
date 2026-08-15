/**
 * EMI CALCULATOR ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 21 & Section 14 (Prompt)
 */

import { EmiResult } from '../types';

/**
 * Calculates Equated Monthly Installment (EMI).
 * Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * Monthly rate: r = annualRate / 12
 * Handles zero-interest loans: EMI = P / n
 *
 * @param principal - Loan principal amount (P)
 * @param annualRate - Nominal annual interest rate as decimal (e.g. 0.085 for 8.5%)
 * @param tenureMonths - Loan tenure in months (n)
 */
export function calculateEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number
): EmiResult {
  if (principal < 0) throw new Error('Principal cannot be negative.');
  if (tenureMonths <= 0) throw new Error('Tenure months must be greater than zero.');
  if (annualRate < 0) throw new Error('Annual rate cannot be negative.');

  let monthlyEmi = 0;

  if (annualRate === 0) {
    monthlyEmi = principal / tenureMonths;
  } else {
    const r = annualRate / 12;
    const factor = Math.pow(1 + r, tenureMonths);
    monthlyEmi = (principal * r * factor) / (factor - 1);
  }

  const totalPayment = monthlyEmi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyEmi,
    totalInterest,
    totalPayment,
    principal,
    tenureMonths,
    annualRate,
  };
}
