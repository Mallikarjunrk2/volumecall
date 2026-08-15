/**
 * LOAN AMORTIZATION ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 22 & Section 14 (Prompt)
 */

import { AmortizationSchedule, AmortizationRow } from '../types';
import { calculateEmi } from './emi';

/**
 * Generates month-by-month loan amortization schedule.
 *
 * @param principal - Outstanding loan principal
 * @param annualRate - Nominal annual rate as decimal
 * @param tenureMonths - Loan tenure in months
 * @param customMonthlyEmi - Optional custom EMI if overriding standard calculation
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  customMonthlyEmi?: number
): AmortizationSchedule {
  const emiRes = calculateEmi(principal, annualRate, tenureMonths);
  const emi = customMonthlyEmi ?? emiRes.monthlyEmi;
  const monthlyRate = annualRate / 12;

  const rows: AmortizationRow[] = [];
  let openingBalance = principal;
  let accumulatedInterest = 0;
  let accumulatedPayment = 0;

  for (let month = 1; month <= tenureMonths; month++) {
    if (openingBalance <= 0) break;

    const interest = openingBalance * monthlyRate;
    let principalPaid = emi - interest;
    let currentEmi = emi;

    if (openingBalance < principalPaid || month === tenureMonths) {
      principalPaid = openingBalance;
      currentEmi = principalPaid + interest;
    }

    const closingBalance = Math.max(0, openingBalance - principalPaid);
    accumulatedInterest += interest;
    accumulatedPayment += currentEmi;

    rows.push({
      month,
      openingBalance,
      emi: currentEmi,
      interest,
      principal: principalPaid,
      closingBalance,
    });

    openingBalance = closingBalance;
  }

  return {
    rows,
    totalInterest: accumulatedInterest,
    totalPayment: accumulatedPayment,
  };
}
