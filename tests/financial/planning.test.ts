import { describe, it, expect } from 'vitest';
import {
  calculateFutureCost,
  calculateInflationPresentValue,
  calculateRealReturn,
} from '../../src/lib/financial/planning/inflation';
import { calculateRetirementCorpus } from '../../src/lib/financial/planning/retirement';
import { calculateGoalSip } from '../../src/lib/financial/planning/goalPlanning';
import { calculateEmergencyFund } from '../../src/lib/financial/planning/emergencyFund';

describe('Planning Engine', () => {
  it('calculates future inflation cost based on spec example', () => {
    // Spec Example: Current cost = 10,00,000, Inflation = 6%, Time = 20 years -> FV ≈ 32,07,135
    const res = calculateFutureCost(1000000, 0.06, 20);
    expect(res.futureValue).toBeCloseTo(3207135.47, 1);

    const pvRes = calculateInflationPresentValue(res.futureValue, 0.06, 20);
    expect(pvRes.presentValue).toBeCloseTo(1000000, 1);
  });

  it('calculates exact Fisher Real Return based on spec example', () => {
    // Spec Example: Nominal = 12%, Inflation = 6% -> 1.12 / 1.06 - 1 ≈ 5.66%
    const res = calculateRealReturn(0.12, 0.06);
    expect(res.realReturn).toBeCloseTo(0.05660377, 6);
    // Ensure it is NOT simply nominal - inflation (0.06)
    expect(res.realReturn).not.toBe(0.06);
  });

  it('calculates retirement corpus requirement and post-retirement SWP simulation', () => {
    // Current age 30, retirement age 60 (30 years away), life expectancy 85 (25 years in retirement)
    const retRes = calculateRetirementCorpus(50000, 30, 60, 85, 0.06, 0.12, 0.08);
    expect(retRes.firstYearMonthlyExpenseAtRetirement).toBeGreaterThan(50000);
    expect(retRes.requiredCorpus).toBeGreaterThan(0);
    expect(retRes.simulation.monthsSurvived).toBe(300); // 25 years * 12
    expect(retRes.requiredMonthlySip).toBeGreaterThan(0);
    expect(retRes.paymentTiming).toBe('beginning');
  });

  it('supports beginning vs end payment timing for pre-retirement SIP accumulation', () => {
    const defaultRes = calculateRetirementCorpus(50000, 30, 60, 85, 0.06, 0.12, 0.08);
    const begRes = calculateRetirementCorpus(50000, 30, 60, 85, 0.06, 0.12, 0.08, 'beginning');
    const endRes = calculateRetirementCorpus(50000, 30, 60, 85, 0.06, 0.12, 0.08, 'end');

    // Default must equal 'beginning' timing
    expect(defaultRes.requiredMonthlySip).toBe(begRes.requiredMonthlySip);

    // End-of-period SIP requires higher contribution than beginning-of-period SIP
    expect(endRes.requiredMonthlySip).toBeGreaterThan(begRes.requiredMonthlySip);
  });

  it('calculates goal SIP taking existing investments into account', () => {
    // Target 50,00,000 in 10 years, existing investment 5,00,000 at 12% expected return
    const goalRes = calculateGoalSip(5000000, 500000, 0.12, 10, 'beginning');
    expect(goalRes.futureValueOfExisting).toBeGreaterThan(500000);
    expect(goalRes.remainingGoalCorpus).toBe(5000000 - goalRes.futureValueOfExisting);
    expect(goalRes.requiredMonthlySip).toBeGreaterThan(0);
  });

  it('calculates goal scenarios for 10%, 12%, 15% and custom return rates', () => {
    const target = 50000000; // 5 Crores
    const years = 10;

    const res10 = calculateGoalSip(target, 0, 0.10, years, 'end', 'monthly');
    const res12 = calculateGoalSip(target, 0, 0.12, years, 'end', 'monthly');
    const res15 = calculateGoalSip(target, 0, 0.15, years, 'end', 'monthly');
    const resCustom = calculateGoalSip(target, 0, 0.145, years, 'end', 'monthly');

    // Higher expected return rate requires lower monthly SIP
    expect(res10.requiredPayment).toBeGreaterThan(res12.requiredPayment);
    expect(res12.requiredPayment).toBeGreaterThan(res15.requiredPayment);
    expect(resCustom.requiredPayment).toBeLessThan(res12.requiredPayment);
    expect(resCustom.requiredPayment).toBeGreaterThan(res15.requiredPayment);
  });

  it('supports monthly, quarterly, and annual investment frequencies for goal planning', () => {
    const target = 10000000; // 1 Crore
    const years = 10;
    const rate = 0.12;

    const monthlyRes = calculateGoalSip(target, 0, rate, years, 'end', 'monthly');
    const quarterlyRes = calculateGoalSip(target, 0, rate, years, 'end', 'quarterly');
    const annualRes = calculateGoalSip(target, 0, rate, years, 'end', 'annual');

    // Quarterly payment should be roughly 3x monthly, annual roughly 12x monthly
    expect(quarterlyRes.requiredPayment).toBeGreaterThan(monthlyRes.requiredPayment * 2.5);
    expect(annualRes.requiredPayment).toBeGreaterThan(monthlyRes.requiredPayment * 10);
  });

  it('handles zero or invalid goal input parameters safely without NaN', () => {
    const zeroRes = calculateGoalSip(0, 0, 0.12, 10, 'end', 'monthly');
    expect(zeroRes.requiredPayment).toBe(0);
    expect(zeroRes.totalInvested).toBe(0);
    expect(zeroRes.estimatedGrowth).toBe(0);
    expect(isNaN(zeroRes.requiredPayment)).toBe(false);
  });

  it('calculates emergency fund requirements', () => {
    const efRes = calculateEmergencyFund(40000, 6, 50000);
    expect(efRes.requiredEmergencyFund).toBe(240000);
    expect(efRes.additionalSavingsNeeded).toBe(190000);
  });
});
