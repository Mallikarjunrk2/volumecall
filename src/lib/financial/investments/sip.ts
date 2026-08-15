/**
 * SIP CALCULATOR ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 3 & Section 6
 */

import { PaymentTiming, CompoundingFrequency, SipResult, SipScheduleRow } from '../types';
import { effectiveAnnualToPeriodic, periodsPerYearFromFrequency } from '../rates/rateConversion';
import { getPaymentTimingMultiplier } from '../cashflow/payments';

/**
 * Calculates fixed periodic SIP investment growth and schedule.
 *
 * @param periodicPayment - Amount invested per period (P)
 * @param expectedAnnualReturn - Effective annual return rate as decimal (e.g. 0.12 for 12%)
 * @param durationYears - Investment duration in years
 * @param frequency - SIP frequency (default 'monthly', 12 periods/year)
 * @param paymentTiming - Payment timing convention: 'beginning' or 'end' (default 'end')
 * @param isEffectiveRate - Whether expectedAnnualReturn is effective annual rate (default true)
 * @param generateSchedule - Whether to return full schedule rows (default false)
 */
export function calculateSip(
  periodicPayment: number,
  expectedAnnualReturn: number,
  durationYears: number,
  frequency: CompoundingFrequency = 'monthly',
  paymentTiming: PaymentTiming = 'end',
  isEffectiveRate: boolean = true,
  generateSchedule: boolean = false
): SipResult {
  if (periodicPayment < 0) throw new Error('Periodic payment cannot be negative.');
  if (durationYears < 0) throw new Error('Duration cannot be negative.');

  const periodsPerYear = periodsPerYearFromFrequency(frequency);
  const totalPeriods = Math.round(periodsPerYear * durationYears);
  const investedAmount = periodicPayment * totalPeriods;

  if (totalPeriods === 0) {
    return {
      investedAmount: 0,
      estimatedReturns: 0,
      totalValue: 0,
      periodicPayment,
      periodsPerYear,
      durationYears,
      expectedAnnualReturn,
      paymentTiming,
      schedule: [],
    };
  }

  // Periodic rate conversion
  const periodicRate = expectedAnnualReturn === 0
    ? 0
    : isEffectiveRate
      ? effectiveAnnualToPeriodic(expectedAnnualReturn, frequency)
      : expectedAnnualReturn / periodsPerYear;

  let totalValue = 0;

  if (periodicRate === 0) {
    totalValue = investedAmount;
  } else {
    const timingMult = getPaymentTimingMultiplier(paymentTiming, periodicRate);
    const annuityFactor = (Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate;
    totalValue = periodicPayment * annuityFactor * timingMult;
  }

  const estimatedReturns = totalValue - investedAmount;

  let schedule: SipScheduleRow[] | undefined;
  if (generateSchedule) {
    schedule = [];
    let currentBalance = 0;
    let accumulatedInvested = 0;

    for (let p = 1; p <= totalPeriods; p++) {
      const deposit = periodicPayment;
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
        period: p,
        deposit,
        interestEarned,
        totalInvested: accumulatedInvested,
        closingBalance: currentBalance,
      });
    }
  }

  return {
    investedAmount,
    estimatedReturns,
    totalValue,
    periodicPayment,
    periodsPerYear,
    durationYears,
    expectedAnnualReturn,
    paymentTiming,
    schedule,
  };
}
