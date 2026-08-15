/**
 * LOAN PREPAYMENT CALCULATOR ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 23
 */

import { PrepaymentResult } from '../types';
import { generateAmortizationSchedule } from './amortization';
import { calculateEmi } from './emi';

/**
 * Calculates loan prepayment impact.
 *
 * @param principal - Current outstanding principal balance
 * @param annualRate - Nominal annual rate as decimal
 * @param remainingTenureMonths - Remaining loan tenure in months
 * @param prepaymentAmount - Lump-sum prepayment amount
 * @param method - 'reduceTenure' (keep EMI fixed, reduce tenure) or 'reduceEmi' (keep tenure fixed, reduce EMI)
 */
export function calculatePrepayment(
  principal: number,
  annualRate: number,
  remainingTenureMonths: number,
  prepaymentAmount: number,
  method: 'reduceTenure' | 'reduceEmi' = 'reduceTenure'
): PrepaymentResult {
  if (prepaymentAmount < 0) throw new Error('Prepayment amount cannot be negative.');
  if (prepaymentAmount >= principal) throw new Error('Prepayment amount cannot exceed or equal principal.');

  const originalSchedule = generateAmortizationSchedule(principal, annualRate, remainingTenureMonths);
  const newPrincipal = principal - prepaymentAmount;
  const monthlyRate = annualRate / 12;

  if (method === 'reduceTenure') {
    // Keep current EMI fixed, calculate new shorter tenure
    const currentEmi = originalSchedule.rows[0]?.emi ?? calculateEmi(principal, annualRate, remainingTenureMonths).monthlyEmi;

    // Formula to solve for n with newPrincipal and currentEmi:
    // currentEmi = P * r * (1+r)^n / ((1+r)^n - 1) => (1+r)^n = currentEmi / (currentEmi - P*r)
    let newTenureMonths = remainingTenureMonths;
    if (annualRate === 0) {
      newTenureMonths = Math.ceil(newPrincipal / currentEmi);
    } else {
      const pR = newPrincipal * monthlyRate;
      if (currentEmi <= pR) {
        throw new Error('Current EMI is too low to service interest on new principal.');
      }
      const val = currentEmi / (currentEmi - pR);
      newTenureMonths = Math.ceil(Math.log(val) / Math.log(1 + monthlyRate));
    }

    const newSchedule = generateAmortizationSchedule(newPrincipal, annualRate, newTenureMonths, currentEmi);
    const interestSavings = originalSchedule.totalInterest - newSchedule.totalInterest;

    return {
      originalSchedule,
      newSchedule,
      interestSavings,
      tenureReductionMonths: remainingTenureMonths - newSchedule.rows.length,
    };
  } else {
    // Keep tenure fixed, calculate new lower EMI
    const newEmiRes = calculateEmi(newPrincipal, annualRate, remainingTenureMonths);
    const newSchedule = generateAmortizationSchedule(newPrincipal, annualRate, remainingTenureMonths, newEmiRes.monthlyEmi);
    const interestSavings = originalSchedule.totalInterest - newSchedule.totalInterest;

    return {
      originalSchedule,
      newSchedule,
      interestSavings,
      newMonthlyEmi: newEmiRes.monthlyEmi,
    };
  }
}
