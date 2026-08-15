/**
 * STEP-UP SIP CALCULATOR ENGINE (PERIODIC SIMULATION)
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 16 & Section 7
 */

import { PaymentTiming, CompoundingFrequency, StepUpSipResult, StepUpSipScheduleRow } from '../types';
import { effectiveAnnualToPeriodic, periodsPerYearFromFrequency } from '../rates/rateConversion';

/**
 * Calculates Step-Up SIP growth using period-by-period simulation.
 *
 * @param startingSip - Initial contribution amount per period
 * @param stepUpPercentage - Annual percentage step-up rate as decimal (e.g. 0.10 for 10%)
 * @param expectedAnnualReturn - Effective annual return rate as decimal (e.g. 0.12 for 12%)
 * @param durationYears - Total tenure in years
 * @param paymentTiming - 'beginning' or 'end' of period payment timing (default 'end')
 * @param fixedStepUpAmount - Optional fixed annual dollar/rupee increase instead of percentage
 * @param frequency - Contribution/compounding frequency (default 'monthly')
 */
export function calculateStepUpSip(
  startingSip: number,
  stepUpPercentage: number,
  expectedAnnualReturn: number,
  durationYears: number,
  paymentTiming: PaymentTiming = 'end',
  fixedStepUpAmount?: number,
  frequency: CompoundingFrequency = 'monthly'
): StepUpSipResult {
  if (startingSip < 0) throw new Error('Starting SIP cannot be negative.');
  if (durationYears < 0) throw new Error('Duration cannot be negative.');

  const periodsPerYear = periodsPerYearFromFrequency(frequency);
  const totalPeriods = Math.round(durationYears * periodsPerYear);
  const periodicRate = expectedAnnualReturn === 0
    ? 0
    : effectiveAnnualToPeriodic(expectedAnnualReturn, frequency);

  const schedule: StepUpSipScheduleRow[] = [];
  let currentPeriodicSip = startingSip;
  let currentBalance = 0;
  let accumulatedInvested = 0;

  for (let period = 1; period <= totalPeriods; period++) {
    const year = Math.ceil(period / periodsPerYear);

    // Apply step-up at year boundaries (e.g. for monthly, at period 13, 25, 37...)
    if (period > 1 && (period - 1) % periodsPerYear === 0) {
      if (fixedStepUpAmount && fixedStepUpAmount > 0) {
        currentPeriodicSip += fixedStepUpAmount;
      } else {
        currentPeriodicSip = currentPeriodicSip * (1 + stepUpPercentage);
      }
    }

    const deposit = currentPeriodicSip;
    let interestEarned = 0;

    if (paymentTiming === 'beginning') {
      currentBalance += deposit;
      accumulatedInvested += deposit;
      interestEarned = currentBalance * periodicRate;
      currentBalance += interestEarned;
    } else {
      interestEarned = currentBalance * periodicRate;
      currentBalance += interestEarned + deposit;
      accumulatedInvested += deposit;
    }

    schedule.push({
      year,
      month: period, // period index
      period,
      monthlySip: currentPeriodicSip,
      deposit,
      interestEarned,
      totalInvested: accumulatedInvested,
      closingBalance: currentBalance,
    });
  }

  const investedAmount = accumulatedInvested;
  const totalValue = currentBalance;
  const estimatedReturns = totalValue - investedAmount;

  return {
    investedAmount,
    estimatedReturns,
    totalValue,
    startingSip,
    stepUpPercentage,
    fixedStepUpAmount,
    durationYears,
    paymentTiming,
    frequency,
    schedule,
  };
}
