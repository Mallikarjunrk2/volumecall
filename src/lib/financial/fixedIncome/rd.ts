/**
 * RECURRING DEPOSIT (RD) ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 14 & Section 16 (Prompt)
 */

import { RdResult, RdScheduleRow, CompoundingFrequency } from '../types';
import { periodsPerYearFromFrequency } from '../rates/rateConversion';

/**
 * Calculates Recurring Deposit maturity value and month-by-month schedule using installment-by-installment compounding.
 *
 * Formula at month k:
 * accumulatedBalance_k = SUM_{m=1}^k [ P * (1 + r/n)^(n * (k - m + 1) / 12) ]
 *
 * @param monthlyInstallment - Monthly deposit amount (P)
 * @param annualRate - Nominal annual rate as decimal (e.g. 0.07 for 7%)
 * @param tenureMonths - Total duration in months
 * @param compoundingFrequency - Compounding frequency (default 'quarterly')
 */
export function calculateRd(
  monthlyInstallment: number,
  annualRate: number,
  tenureMonths: number,
  compoundingFrequency: CompoundingFrequency = 'quarterly'
): RdResult {
  if (monthlyInstallment < 0) throw new Error('Monthly installment cannot be negative.');
  if (tenureMonths < 0) throw new Error('Tenure months cannot be negative.');

  const n = periodsPerYearFromFrequency(compoundingFrequency);
  const periodicRate = annualRate / n;

  const schedule: RdScheduleRow[] = [];

  for (let k = 1; k <= tenureMonths; k++) {
    const totalDeposit = k * monthlyInstallment;

    // Calculate accumulated balance at month k across all installments m = 1..k
    let accumulatedBalanceAtMonthK = 0;
    for (let m = 1; m <= k; m++) {
      const holdingMonths = k - m + 1;
      const holdingYears = holdingMonths / 12;
      const compoundingPeriods = n * holdingYears;
      accumulatedBalanceAtMonthK += monthlyInstallment * Math.pow(1 + periodicRate, compoundingPeriods);
    }

    const interestEarnedAtMonthK = accumulatedBalanceAtMonthK - totalDeposit;

    schedule.push({
      month: k,
      installment: monthlyInstallment,
      interestEarned: interestEarnedAtMonthK,
      totalDeposit,
      closingBalance: accumulatedBalanceAtMonthK,
    });
  }

  const finalRow = schedule[schedule.length - 1];
  const maturityAmount = finalRow ? finalRow.closingBalance : 0;
  const totalInvested = tenureMonths * monthlyInstallment;
  const interestEarned = maturityAmount - totalInvested;

  return {
    monthlyInstallment,
    totalInvested,
    interestEarned,
    maturityAmount,
    tenureMonths,
    annualRate,
    schedule,
  };
}
