/**
 * STP CALCULATOR ENGINE (DUAL-FUND SIMULATION)
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 1 (Cash Flow Engine)
 */

import { StpResult, StpScheduleRow } from '../types';
import { effectiveAnnualToPeriodic } from '../rates/rateConversion';

/**
 * Calculates Systematic Transfer Plan (STP) between two funds.
 *
 * @param sourceInitial - Starting capital in source fund
 * @param monthlyTransfer - Amount transferred monthly from source to target
 * @param sourceAnnualReturn - Effective annual return of source fund as decimal
 * @param targetAnnualReturn - Effective annual return of target fund as decimal
 * @param durationMonths - Transfer duration in months
 */
export function calculateStp(
  sourceInitial: number,
  monthlyTransfer: number,
  sourceAnnualReturn: number,
  targetAnnualReturn: number,
  durationMonths: number
): StpResult {
  if (sourceInitial < 0) throw new Error('Source initial balance cannot be negative.');
  if (monthlyTransfer < 0) throw new Error('Monthly transfer cannot be negative.');
  if (durationMonths < 0) throw new Error('Duration cannot be negative.');

  const sourceMonthlyRate = sourceAnnualReturn === 0 ? 0 : effectiveAnnualToPeriodic(sourceAnnualReturn, 'monthly');
  const targetMonthlyRate = targetAnnualReturn === 0 ? 0 : effectiveAnnualToPeriodic(targetAnnualReturn, 'monthly');

  const schedule: StpScheduleRow[] = [];
  let sourceBalance = sourceInitial;
  let targetBalance = 0;
  let totalTransferred = 0;

  for (let month = 1; month <= durationMonths; month++) {
    if (sourceBalance <= 0) break;

    const sourceOpening = sourceBalance;
    const sourceGrowth = sourceOpening * sourceMonthlyRate;
    const sourceAfterGrowth = sourceOpening + sourceGrowth;

    let actualTransfer = monthlyTransfer;
    if (sourceAfterGrowth < monthlyTransfer) {
      actualTransfer = sourceAfterGrowth;
      sourceBalance = 0;
    } else {
      sourceBalance = sourceAfterGrowth - monthlyTransfer;
    }

    totalTransferred += actualTransfer;

    const targetOpening = targetBalance;
    const targetGrowth = targetOpening * targetMonthlyRate;
    targetBalance = targetOpening + targetGrowth + actualTransfer;

    schedule.push({
      month,
      sourceOpening,
      sourceGrowth,
      transferAmount: actualTransfer,
      sourceClosing: sourceBalance,
      targetOpening,
      targetGrowth,
      targetClosing: targetBalance,
    });
  }

  return {
    sourceInitial,
    sourceRemaining: sourceBalance,
    targetValue: targetBalance,
    totalTransferred,
    durationMonths,
    schedule,
  };
}
