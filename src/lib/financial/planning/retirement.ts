/**
 * RETIREMENT CORPUS & SIMULATION ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 17
 */

import { SwpResult, PaymentTiming } from '../types';
import { calculateSwp } from '../investments/swp';
import { calculateFutureCost } from './inflation';

export interface RetirementCorpusResult {
  currentMonthlyExpense: number;
  currentAge: number;
  retirementAge: number;
  yearsToRetirement: number;
  yearsInRetirement: number;
  inflationRate: number;
  expectedPreRetirementReturn: number;
  expectedPostRetirementReturn: number;
  firstYearMonthlyExpenseAtRetirement: number;
  firstYearAnnualExpenseAtRetirement: number;
  requiredCorpus: number;
  requiredMonthlySip: number;
  paymentTiming: PaymentTiming;
  simulation: SwpResult;
}

/**
 * Calculates required retirement corpus using inflation growth and post-retirement month-by-month SWP simulation.
 *
 * @param currentMonthlyExpense - Current monthly living expenses
 * @param currentAge - Current age of user
 * @param retirementAge - Target retirement age
 * @param lifeExpectancy - Target life expectancy age (e.g. 85)
 * @param inflationRate - Expected annual inflation as decimal (e.g. 0.06)
 * @param preRetirementReturn - Expected annual return on investments before retirement as decimal (e.g. 0.12)
 * @param postRetirementReturn - Expected annual return on corpus after retirement as decimal (e.g. 0.08)
 * @param paymentTiming - Payment timing for pre-retirement monthly SIP accumulation: 'beginning' or 'end' (default 'beginning')
 */
export function calculateRetirementCorpus(
  currentMonthlyExpense: number,
  currentAge: number,
  retirementAge: number,
  lifeExpectancy: number = 85,
  inflationRate: number = 0.06,
  preRetirementReturn: number = 0.12,
  postRetirementReturn: number = 0.08,
  paymentTiming: PaymentTiming = 'beginning'
): RetirementCorpusResult {
  if (retirementAge <= currentAge) throw new Error('Retirement age must be greater than current age.');
  if (lifeExpectancy <= retirementAge) throw new Error('Life expectancy must be greater than retirement age.');

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;

  // 1. Inflate current monthly expense to retirement age
  const inflatedCost = calculateFutureCost(currentMonthlyExpense, inflationRate, yearsToRetirement);
  const firstYearMonthlyExpenseAtRetirement = inflatedCost.futureValue;
  const firstYearAnnualExpenseAtRetirement = firstYearMonthlyExpenseAtRetirement * 12;

  // 2. Binary search / numerical solve for exact corpus needed so post-retirement SWP simulation survives yearsInRetirement with balance >= 0
  let low = 0;
  let high = firstYearAnnualExpenseAtRetirement * yearsInRetirement * 3; // safe upper bound
  let requiredCorpus = high;

  for (let iter = 0; iter < 50; iter++) {
    const mid = (low + high) / 2;
    const sim = calculateSwp(mid, postRetirementReturn, firstYearMonthlyExpenseAtRetirement, yearsInRetirement, inflationRate);
    if (sim.monthsSurvived >= yearsInRetirement * 12 && sim.remainingCorpus >= 0) {
      requiredCorpus = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  const simulation = calculateSwp(requiredCorpus, postRetirementReturn, firstYearMonthlyExpenseAtRetirement, yearsInRetirement, inflationRate);

  // 3. Monthly SIP required during pre-retirement phase to accumulate requiredCorpus
  // Beginning-of-period: SIP = FV / [ ((1+i)^n - 1) / i * (1+i) ]
  // End-of-period: SIP = FV / [ ((1+i)^n - 1) / i ]
  const monthlyRatePre = (1 + preRetirementReturn) ** (1 / 12) - 1;
  const totalPreMonths = yearsToRetirement * 12;
  const annuityFactor = ((1 + monthlyRatePre) ** totalPreMonths - 1) / monthlyRatePre;
  const timingMult = paymentTiming === 'beginning' ? 1 + monthlyRatePre : 1;
  const requiredMonthlySip = requiredCorpus / (annuityFactor * timingMult);

  return {
    currentMonthlyExpense,
    currentAge,
    retirementAge,
    yearsToRetirement,
    yearsInRetirement,
    inflationRate,
    expectedPreRetirementReturn: preRetirementReturn,
    expectedPostRetirementReturn: postRetirementReturn,
    firstYearMonthlyExpenseAtRetirement,
    firstYearAnnualExpenseAtRetirement,
    requiredCorpus,
    requiredMonthlySip,
    paymentTiming,
    simulation,
  };
}
