import { describe, it, expect } from 'vitest';
import { calculateCompoundInterest } from '../../src/lib/financial/compounding/compoundInterest';
import { calculateFutureValue } from '../../src/lib/financial/compounding/futureValue';
import { calculatePresentValue } from '../../src/lib/financial/compounding/presentValue';

describe('Compounding Engine', () => {
  it('calculates compound interest correctly based on spec example', () => {
    // Spec Example: P = 1,00,000, r = 10%, n = 1, t = 10 -> A ≈ 2,59,374
    const result = calculateCompoundInterest(100000, 0.10, 10, 'annual');
    expect(result.totalAmount).toBeCloseTo(259374.246, 2);
    expect(result.interest).toBeCloseTo(159374.246, 2);
  });

  it('calculates future value correctly', () => {
    const fvRes = calculateFutureValue(10000, 0.05, 5);
    // 10000 * (1.05)^5 = 12762.8156
    expect(fvRes.futureValue).toBeCloseTo(12762.8156, 4);
    expect(fvRes.totalGrowth).toBeCloseTo(2762.8156, 4);
  });

  it('calculates present value correctly', () => {
    const pvRes = calculatePresentValue(12762.8156, 0.05, 5);
    expect(pvRes.presentValue).toBeCloseTo(10000, 2);
  });

  it('handles zero interest rate', () => {
    const res = calculateCompoundInterest(50000, 0, 5, 'monthly');
    expect(res.totalAmount).toBe(50000);
    expect(res.interest).toBe(0);
  });

  it('handles zero duration', () => {
    const res = calculateCompoundInterest(100000, 0.12, 0, 'annual');
    expect(res.totalAmount).toBe(100000);
    expect(res.interest).toBe(0);
  });

  it('handles large principal and tenure without precision breakdown', () => {
    const res = calculateCompoundInterest(1e9, 0.15, 30, 'quarterly');
    expect(res.totalAmount).toBeGreaterThan(1e9);
    expect(isFinite(res.totalAmount)).toBe(true);
  });

  it('throws error for negative inputs', () => {
    expect(() => calculateCompoundInterest(-100, 0.05, 5)).toThrow();
    expect(() => calculateFutureValue(-100, 0.05, 5)).toThrow();
    expect(() => calculatePresentValue(-100, 0.05, 5)).toThrow();
  });
});
