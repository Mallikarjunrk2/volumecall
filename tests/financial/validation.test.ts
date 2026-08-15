import { describe, it, expect } from 'vitest';
import {
  validatePositiveNumber,
  validateRate,
  validateCashFlowsForXirr,
  validateWaccAndGrowth,
  validateKeAndGrowth,
} from '../../src/lib/financial/validation/validation';
import { calculatePrepayment } from '../../src/lib/financial/loans/prepayment';

describe('Validation Engine', () => {
  it('validates positive numbers', () => {
    expect(validatePositiveNumber(100, 'Amount')).toBeNull();
    expect(validatePositiveNumber(-5, 'Amount')?.code).toBe('NEGATIVE_VALUE');
    expect(validatePositiveNumber(NaN, 'Amount')?.code).toBe('INVALID_NUMBER');
  });

  it('validates very large valid numbers (₹100 Crore / 1 Billion+)', () => {
    const oneCrore = 10_000_000;
    const hundredCrore = 100 * oneCrore; // 1,000,000,000 (1 Billion)
    expect(validatePositiveNumber(hundredCrore, '100 Crore Amount')).toBeNull();

    const tenBillion = 10_000_000_000;
    expect(validatePositiveNumber(tenBillion, '10 Billion Amount')).toBeNull();
  });

  it('validates interest rates', () => {
    expect(validateRate(0.12, 'Rate')).toBeNull();
    expect(validateRate(-1.5, 'Rate')?.code).toBe('RATE_TOO_LOW');
  });

  it('validates cash flows for XIRR', () => {
    const validFlows = [
      { date: new Date('2024-01-01'), amount: -100 },
      { date: new Date('2024-06-01'), amount: 120 },
    ];
    expect(validateCashFlowsForXirr(validFlows).isValid).toBe(true);

    const invalidFlows = [
      { date: new Date('2024-01-01'), amount: 100 },
      { date: new Date('2024-06-01'), amount: 120 },
    ];
    const res = validateCashFlowsForXirr(invalidFlows);
    expect(res.isValid).toBe(false);
    expect(res.errors[0].code).toBe('XIRR_SIGN_MISMATCH');
  });

  it('validates WACC > terminal growth rate', () => {
    expect(validateWaccAndGrowth(0.10, 0.03).isValid).toBe(true);
    const res = validateWaccAndGrowth(0.03, 0.05);
    expect(res.isValid).toBe(false);
    expect(res.errors[0].code).toBe('WACC_LESS_THAN_GROWTH');
  });

  it('validates Ke > dividend growth rate', () => {
    expect(validateKeAndGrowth(0.12, 0.05).isValid).toBe(true);
    const res = validateKeAndGrowth(0.05, 0.05);
    expect(res.isValid).toBe(false);
    expect(res.errors[0].code).toBe('KE_LESS_THAN_GROWTH');
  });

  it('triggers prepayment exception rules correctly', () => {
    // Negative prepayment
    expect(() => calculatePrepayment(5000000, 0.08, 240, -50000)).toThrow('Prepayment amount cannot be negative');

    // Prepayment equal to principal
    expect(() => calculatePrepayment(5000000, 0.08, 240, 5000000)).toThrow('Prepayment amount cannot exceed or equal principal');

    // Prepayment greater than principal
    expect(() => calculatePrepayment(5000000, 0.08, 240, 6000000)).toThrow('Prepayment amount cannot exceed or equal principal');
  });
});
