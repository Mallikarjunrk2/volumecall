import { describe, it, expect } from 'vitest';
import { calculateAbsoluteReturn } from '../../src/lib/financial/returns/absoluteReturn';
import { calculateCagr } from '../../src/lib/financial/returns/cagr';
import { calculateIrr } from '../../src/lib/financial/returns/irr';
import { calculateXirr } from '../../src/lib/financial/returns/xirr';
import { calculateTwr } from '../../src/lib/financial/returns/twr';

describe('Returns Engine', () => {
  it('calculates absolute return correctly', () => {
    // Investment = 1,00,000, Current = 1,25,000 -> 25%
    const res = calculateAbsoluteReturn(100000, 125000);
    expect(res.gain).toBe(25000);
    expect(res.returnPercentage).toBe(25);
  });

  it('handles zero investment in absolute return safely', () => {
    const res = calculateAbsoluteReturn(0, 1000);
    expect(res.returnPercentage).toBe(0);
  });

  it('calculates CAGR correctly based on spec example', () => {
    // Spec Example: PV = 1,00,000, FV = 2,00,000, t = 5 -> CAGR ≈ 14.87%
    const res = calculateCagr(100000, 200000, 5);
    expect(res.cagr).toBeCloseTo(0.148698, 5);
  });

  it('calculates IRR for regular cash flows', () => {
    // Initial investment -1000, returns +400, +400, +400
    const res = calculateIrr([-1000, 400, 400, 400]);
    expect(res.success).toBe(true);
    expect(res.irr!).toBeCloseTo(0.09701, 4); // ~9.70%
  });

  it('calculates XIRR for irregular date cash flows based on spec example', () => {
    // Spec Example:
    // 01-01-2024 -10000
    // 01-02-2024 -10000
    // 01-03-2024 -10000
    // 01-01-2025  35000
    const cashFlows = [
      { date: new Date('2024-01-01'), amount: -10000 },
      { date: new Date('2024-02-01'), amount: -10000 },
      { date: new Date('2024-03-01'), amount: -10000 },
      { date: new Date('2025-01-01'), amount: 35000 },
    ];
    const res = calculateXirr(cashFlows);
    expect(res.success).toBe(true);
    expect(res.xirr).not.toBeNull();
    expect(res.xirr!).toBeGreaterThan(0);
  });

  it('handles invalid cash flows for XIRR', () => {
    // All positive cash flows
    const allPositive = [
      { date: new Date('2024-01-01'), amount: 10000 },
      { date: new Date('2024-02-01'), amount: 10000 },
    ];
    const res = calculateXirr(allPositive);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('calculates TWR across sub-periods accurately', () => {
    // Sub-period 1: Start 100, End 110 (10% return)
    // Sub-period 2: Start 150 (after 40 deposit), End 180 (20% return)
    // Total TWR = (1.10 * 1.20) - 1 = 32%
    const subPeriods = [
      {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        startValue: 100,
        endValueBeforeCashFlow: 110,
        cashFlow: 40,
      },
      {
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-31'),
        startValue: 150,
        endValueBeforeCashFlow: 180,
      },
    ];
    const res = calculateTwr(subPeriods);
    expect(res.twr).toBeCloseTo(0.32, 4);
    expect(res.twrPercentage).toBeCloseTo(32, 4);
  });
});
