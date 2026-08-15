/**
 * SWP CALCULATOR ENGINE (PERIOD-BY-PERIOD SIMULATION)
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 8 & Section 9 & Section 8 (Prompt)
 */

import { SwpResult, SwpScheduleRow } from '../types';
import { effectiveAnnualToPeriodic } from '../rates/rateConversion';

/**
 * Calculates Systematic Withdrawal Plan (SWP) using month-by-month simulation.
 * Supports constant or annually increasing withdrawals.
 *
 * @param initialCorpus - Starting investment corpus
 * @param annualReturn - Expected effective annual return rate as decimal (e.g. 0.08 for 8%)
 * @param monthlyWithdrawal - Initial monthly withdrawal amount
 * @param durationYears - Desired simulation duration in years
 * @param annualIncreasePercentage - Optional annual withdrawal increase rate as decimal (e.g. 0.06 for 6%)
 */
export function calculateSwp(
  initialCorpus: number,
  annualReturn: number,
  monthlyWithdrawal: number,
  durationYears: number,
  annualIncreasePercentage: number = 0
): SwpResult {
  if (initialCorpus < 0) throw new Error('Initial corpus cannot be negative.');
  if (monthlyWithdrawal < 0) throw new Error('Monthly withdrawal cannot be negative.');
  if (durationYears < 0) throw new Error('Duration cannot be negative.');

  const totalMonthsTarget = Math.round(durationYears * 12);
  const monthlyRate = annualReturn === 0 ? 0 : effectiveAnnualToPeriodic(annualReturn, 'monthly');

  const schedule: SwpScheduleRow[] = [];
  let currentBalance = initialCorpus;
  let currentWithdrawal = monthlyWithdrawal;
  let totalWithdrawals = 0;
  let monthsSurvived = 0;

  for (let month = 1; month <= totalMonthsTarget; month++) {
    if (currentBalance <= 0) break;

    // Apply annual withdrawal increase at year boundaries (month 13, 25, 37...)
    if (month > 1 && (month - 1) % 12 === 0 && annualIncreasePercentage > 0) {
      currentWithdrawal = currentWithdrawal * (1 + annualIncreasePercentage);
    }

    const openingBalance = currentBalance;
    const growth = openingBalance * monthlyRate;
    const balanceAfterGrowth = openingBalance + growth;

    let actualWithdrawal = currentWithdrawal;
    if (balanceAfterGrowth < currentWithdrawal) {
      actualWithdrawal = balanceAfterGrowth;
      currentBalance = 0;
    } else {
      currentBalance = balanceAfterGrowth - currentWithdrawal;
    }

    totalWithdrawals += actualWithdrawal;
    monthsSurvived++;

    schedule.push({
      month,
      openingBalance,
      growth,
      balanceAfterGrowth,
      withdrawal: actualWithdrawal,
      closingBalance: currentBalance,
    });

    if (currentBalance <= 0) break;
  }

  const yearsSurvived = monthsSurvived / 12;

  return {
    startingCorpus: initialCorpus,
    monthlyWithdrawal,
    totalWithdrawals,
    remainingCorpus: currentBalance,
    monthsSurvived,
    yearsSurvived,
    schedule,
  };
}
