/**
 * GOAL PLANNING ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 15
 */

import { PaymentTiming, InvestmentFrequency } from '../types';
import { effectiveAnnualToPeriodic } from '../rates/rateConversion';
import { calculateFutureValue } from '../compounding/futureValue';

export interface GoalPlanningResult {
  targetCorpus: number;
  existingInvestment: number;
  futureValueOfExisting: number;
  remainingGoalCorpus: number;
  requiredMonthlySip: number;
  requiredPayment: number;
  expectedAnnualReturn: number;
  durationYears: number;
  paymentTiming: PaymentTiming;
  frequency: InvestmentFrequency;
  totalInvested: number;
  estimatedGrowth: number;
}

/**
 * Calculates required periodic investment to reach a financial goal, factoring in existing lump-sum investments.
 *
 * @param targetCorpus - Target future value needed for the goal
 * @param existingInvestment - Current lump-sum investment allocated for this goal
 * @param expectedAnnualReturn - Expected effective annual return as decimal
 * @param durationYears - Goal horizon in years
 * @param paymentTiming - 'beginning' or 'end' of period payment timing (default 'end')
 * @param frequency - 'monthly' | 'quarterly' | 'annual' frequency (default 'monthly')
 */
export function calculateGoalSip(
  targetCorpus: number,
  existingInvestment: number = 0,
  expectedAnnualReturn: number = 0.12,
  durationYears: number = 10,
  paymentTiming: PaymentTiming = 'end',
  frequency: InvestmentFrequency = 'monthly'
): GoalPlanningResult {
  const safeTarget = Math.max(0, targetCorpus);
  const safeDuration = Math.max(0, durationYears);
  const safeReturn = Math.max(0, expectedAnnualReturn);
  const safeExisting = Math.max(0, existingInvestment);

  const periodsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const totalPeriods = Math.round(safeDuration * periodsPerYear);

  let periodicRate = 0;
  if (safeReturn > 0) {
    if (frequency === 'annual') {
      periodicRate = safeReturn;
    } else {
      periodicRate = effectiveAnnualToPeriodic(safeReturn, frequency);
    }
  }

  // 1. Calculate future value of existing investment
  let futureValueOfExisting = safeExisting;
  if (safeExisting > 0 && totalPeriods > 0) {
    const fvExistingRes = calculateFutureValue(safeExisting, periodicRate, totalPeriods);
    futureValueOfExisting = fvExistingRes.futureValue;
  }

  // 2. Remaining goal corpus needed from periodic contributions
  const remainingGoalCorpus = Math.max(0, safeTarget - futureValueOfExisting);

  let requiredPayment = 0;
  if (remainingGoalCorpus > 0 && totalPeriods > 0) {
    if (periodicRate === 0) {
      requiredPayment = remainingGoalCorpus / totalPeriods;
    } else {
      const annuityFactor = (Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate;
      const timingMult = paymentTiming === 'beginning' ? 1 + periodicRate : 1;
      requiredPayment = remainingGoalCorpus / (annuityFactor * timingMult);
    }
  }

  const totalInvested = requiredPayment * totalPeriods + safeExisting;
  const estimatedGrowth = Math.max(0, safeTarget - totalInvested);

  return {
    targetCorpus: safeTarget,
    existingInvestment: safeExisting,
    futureValueOfExisting,
    remainingGoalCorpus,
    requiredMonthlySip: requiredPayment,
    requiredPayment,
    expectedAnnualReturn: safeReturn,
    durationYears: safeDuration,
    paymentTiming,
    frequency,
    totalInvested,
    estimatedGrowth,
  };
}
