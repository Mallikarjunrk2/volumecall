import { describe, it, expect } from 'vitest';
import { calculateFd } from '../../src/lib/financial/fixedIncome/fd';
import { calculateRd } from '../../src/lib/financial/fixedIncome/rd';
import { calculateBondPrice, calculateBondYtm } from '../../src/lib/financial/fixedIncome/bonds';

describe('Fixed Income Engine', () => {
  it('calculates cumulative FD maturity value with quarterly compounding', () => {
    // 1,00,000 at 7.5% quarterly for 1 year -> A = 100000 * (1 + 0.075/4)^4 = 107713.586578... ≈ 107713.59
    const fdRes = calculateFd(100000, 0.075, 1, 'quarterly', true);
    expect(fdRes.maturityAmount).toBeCloseTo(107713.59, 2);
    expect(fdRes.interestEarned).toBeCloseTo(7713.59, 2);
  });

  it('calculates non-cumulative FD periodic payout', () => {
    const fdRes = calculateFd(100000, 0.08, 1, 'quarterly', false);
    expect(fdRes.maturityAmount).toBe(100000);
    expect(fdRes.interestEarned).toBe(8000);
    expect(fdRes.periodicPayout).toBe(2000); // 8000 / 4
  });

  it('calculates RD installment-by-installment compounding and schedule progression', () => {
    const rdRes = calculateRd(5000, 0.07, 12, 'quarterly');
    expect(rdRes.totalInvested).toBe(60000);
    expect(rdRes.maturityAmount).toBeGreaterThan(60000);
    expect(rdRes.schedule.length).toBe(12);

    const periodicRate = 0.07 / 4;

    // Month 1: only installment 1 deposited (held 1 month)
    const expectedMonth1 = 5000 * Math.pow(1 + periodicRate, 4 * (1 / 12));
    expect(rdRes.schedule[0].closingBalance).toBeCloseTo(expectedMonth1, 2);
    expect(rdRes.schedule[0].totalDeposit).toBe(5000);

    // Month 2: installment 1 (held 2 months) + installment 2 (held 1 month)
    const expectedMonth2 = 5000 * Math.pow(1 + periodicRate, 4 * (2 / 12)) + 5000 * Math.pow(1 + periodicRate, 4 * (1 / 12));
    expect(rdRes.schedule[1].closingBalance).toBeCloseTo(expectedMonth2, 2);
    expect(rdRes.schedule[1].totalDeposit).toBe(10000);

    // Middle month (Month 6): balance represents actual accumulated value up to month 6
    let expectedMonth6 = 0;
    for (let m = 1; m <= 6; m++) {
      expectedMonth6 += 5000 * Math.pow(1 + periodicRate, 4 * ((6 - m + 1) / 12));
    }
    expect(rdRes.schedule[5].closingBalance).toBeCloseTo(expectedMonth6, 2);

    // Final month (Month 12): closing balance equals maturityAmount
    expect(rdRes.schedule[11].closingBalance).toBe(rdRes.maturityAmount);
  });

  it('calculates bond pricing and YTM accurately', () => {
    // Face Value 1000, Coupon 8% semi-annual, YTM 8%, Tenure 5 years -> Price = 1000 (par)
    const priceAtPar = calculateBondPrice(1000, 0.08, 0.08, 5, 2);
    expect(priceAtPar).toBeCloseTo(1000, 2);

    // YTM solver at market price 1000 should return 8%
    const ytmRes = calculateBondYtm(1000, 0.08, 1000, 5, 2);
    expect(ytmRes.ytm).toBeCloseTo(0.08, 4);
  });
});
