import { describe, it, expect } from 'vitest';
import { calculateSip } from '../../src/lib/financial/investments/sip';
import { calculateStepUpSip } from '../../src/lib/financial/investments/stepUpSip';
import { calculateSwp } from '../../src/lib/financial/investments/swp';
import { calculateStp } from '../../src/lib/financial/investments/stp';

describe('Investments Engine', () => {
  it('calculates SIP growth for end-of-month payments based on spec example', () => {
    // Spec Example: Monthly SIP = 10,000, Annual Return = 12%, Duration = 10 years (120 months)
    const res = calculateSip(10000, 0.12, 10, 'monthly', 'end', true);
    expect(res.investedAmount).toBe(1200000);
    expect(res.totalValue).toBeGreaterThan(2000000);
    expect(res.estimatedReturns).toBe(res.totalValue - res.investedAmount);
  });

  it('calculates SIP growth for beginning-of-month payments', () => {
    const endRes = calculateSip(10000, 0.12, 10, 'monthly', 'end', true);
    const begRes = calculateSip(10000, 0.12, 10, 'monthly', 'beginning', true);

    // Beginning-of-month SIP should be strictly greater than end-of-month SIP
    expect(begRes.totalValue).toBeGreaterThan(endRes.totalValue);
  });

  it('matches precise EAR-based benchmark values for canonical SIP example', () => {
    // Canonical benchmark: ₹10,000/month, 12% EAR, 10 years, default "end" timing
    const endRes = calculateSip(10000, 0.12, 10, 'monthly', 'end', true);
    expect(endRes.investedAmount).toBe(1200000);
    expect(endRes.totalValue).toBeCloseTo(2219300.41, 2);
    expect(endRes.estimatedReturns).toBeCloseTo(1019300.41, 2);

    const begRes = calculateSip(10000, 0.12, 10, 'monthly', 'beginning', true);
    expect(begRes.investedAmount).toBe(1200000);
    expect(begRes.totalValue).toBeCloseTo(2240358.90, 2);
    expect(begRes.estimatedReturns).toBeCloseTo(1040358.90, 2);

    // Timing difference
    expect(begRes.totalValue - endRes.totalValue).toBeCloseTo(21058.48, 2);
  });

  it('uses default end payment timing when timing argument is omitted', () => {
    const defaultRes = calculateSip(10000, 0.12, 10); // defaults to monthly, end timing
    expect(defaultRes.totalValue).toBeCloseTo(2219300.41, 2);
    expect(defaultRes.paymentTiming).toBe('end');
  });

  it('handles large inputs and long durations safely without NaN or overflow', () => {
    // 1 Crore monthly SIP, 15% return, 50 years
    const largeRes = calculateSip(10000000, 0.15, 50, 'monthly', 'end', true);
    expect(largeRes.investedAmount).toBe(6000000000); // 600 Crores
    expect(largeRes.totalValue).toBeGreaterThan(largeRes.investedAmount);
    expect(Number.isFinite(largeRes.totalValue)).toBe(true);
    expect(isNaN(largeRes.totalValue)).toBe(false);
  });

  it('handles zero return SIP correctly', () => {
    const res = calculateSip(5000, 0, 5, 'monthly', 'end');
    expect(res.investedAmount).toBe(300000);
    expect(res.totalValue).toBe(300000);
    expect(res.estimatedReturns).toBe(0);
  });

  it('calculates Step-Up SIP accurately with simulation (monthly regression case)', () => {
    // 10,000/month, 10% annual step-up, 12% return, 3 years
    const res = calculateStepUpSip(10000, 0.10, 0.12, 3, 'end');
    expect(res.schedule.length).toBe(36);

    // Year 1 (month 1-12): monthly SIP 10,000
    expect(res.schedule[0].monthlySip).toBe(10000);
    expect(res.schedule[11].monthlySip).toBe(10000);

    // Year 2 (month 13-24): monthly SIP 11,000 (10% step up)
    expect(res.schedule[12].monthlySip).toBeCloseTo(11000, 2);

    // Year 3 (month 25-36): monthly SIP 12,100
    expect(res.schedule[24].monthlySip).toBeCloseTo(12100, 2);

    expect(res.totalValue).toBeGreaterThan(res.investedAmount);
  });

  it('supports quarterly, annual, and zero-return Step-Up SIP frequencies', () => {
    // Quarterly Step-Up SIP (30,000/quarter, 10% step-up, 12% return, 2 years = 8 quarters)
    const quarterlyRes = calculateStepUpSip(30000, 0.10, 0.12, 2, 'end', undefined, 'quarterly');
    expect(quarterlyRes.schedule.length).toBe(8);
    expect(quarterlyRes.schedule[0].monthlySip).toBe(30000); // Year 1 (quarters 1-4)
    expect(quarterlyRes.schedule[3].monthlySip).toBe(30000);
    expect(quarterlyRes.schedule[4].monthlySip).toBeCloseTo(33000, 2); // Year 2 (quarters 5-8, +10%)

    // Annual Step-Up SIP (1,00,000/year, 10% step-up, 12% return, 3 years = 3 periods)
    const annualRes = calculateStepUpSip(100000, 0.10, 0.12, 3, 'end', undefined, 'annual');
    expect(annualRes.schedule.length).toBe(3);
    expect(annualRes.schedule[0].monthlySip).toBe(100000); // Year 1
    expect(annualRes.schedule[1].monthlySip).toBeCloseTo(110000, 2); // Year 2
    expect(annualRes.schedule[2].monthlySip).toBeCloseTo(121000, 2); // Year 3

    // Zero-return Step-Up SIP
    const zeroRes = calculateStepUpSip(10000, 0.10, 0, 2, 'end', undefined, 'monthly');
    expect(zeroRes.estimatedReturns).toBe(0);
    expect(zeroRes.totalValue).toBe(zeroRes.investedAmount);
  });

  it('calculates SWP simulation and corpus depletion correctly', () => {
    // Initial corpus 1,00,000, 8% return, 10,000 monthly withdrawal -> should deplete in < 1 year
    const res = calculateSwp(100000, 0.08, 10000, 5);
    expect(res.monthsSurvived).toBeLessThan(12);
    expect(res.remainingCorpus).toBe(0);

    // Initial corpus 50,00,000, 8% return, 30,000 monthly withdrawal -> should survive full 10 years
    const resSurvive = calculateSwp(5000000, 0.08, 30000, 10);
    expect(resSurvive.monthsSurvived).toBe(120);
    expect(resSurvive.remainingCorpus).toBeGreaterThan(0);
  });

  it('handles increasing SWP simulation', () => {
    const res = calculateSwp(5000000, 0.08, 30000, 3, 0.06);
    expect(res.schedule[0].withdrawal).toBe(30000); // Year 1
    expect(res.schedule[12].withdrawal).toBeCloseTo(31800, 1); // Year 2 (+6%)
  });

  it('calculates STP dual-fund transfer simulation', () => {
    const stpRes = calculateStp(500000, 20000, 0.06, 0.12, 12);
    expect(stpRes.schedule.length).toBe(12);
    expect(stpRes.targetValue).toBeGreaterThan(240000);
    expect(stpRes.sourceRemaining).toBeLessThan(500000);
  });
});
