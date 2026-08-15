import { describe, it, expect } from 'vitest';
import {
  effectiveAnnualToPeriodic,
  nominalAnnualToPeriodic,
  periodicToEffectiveAnnual,
} from '../../src/lib/financial/rates/rateConversion';

describe('Rate Conversion Engine', () => {
  it('converts effective annual rate to periodic rates accurately', () => {
    // 12% effective annual rate -> monthly rate
    const monthlyRate = effectiveAnnualToPeriodic(0.12, 'monthly');
    // Math.pow(1.12, 1/12) - 1 ≈ 0.009488792934583046
    expect(monthlyRate).toBeCloseTo(0.00948879, 6);

    // Quarterly rate: (1.12)^(1/4) - 1 ≈ 0.02873734
    const quarterlyRate = effectiveAnnualToPeriodic(0.12, 'quarterly');
    expect(quarterlyRate).toBeCloseTo(0.02873734, 6);

    // Daily rate: (1.12)^(1/365) - 1
    const dailyRate = effectiveAnnualToPeriodic(0.12, 'daily');
    expect(dailyRate).toBeCloseTo(0.00031046, 6);
  });

  it('converts nominal annual rate to periodic rate', () => {
    const monthlyNominal = nominalAnnualToPeriodic(0.12, 'monthly');
    expect(monthlyNominal).toBe(0.01);

    const quarterlyNominal = nominalAnnualToPeriodic(0.12, 'quarterly');
    expect(quarterlyNominal).toBe(0.03);
  });

  it('converts periodic rate back to effective annual rate', () => {
    const monthlyRate = 0.01;
    const effectiveAnnual = periodicToEffectiveAnnual(monthlyRate, 'monthly');
    // (1.01)^12 - 1 = 12.6825%
    expect(effectiveAnnual).toBeCloseTo(0.126825, 6);
  });

  it('handles zero rate conversion', () => {
    expect(effectiveAnnualToPeriodic(0, 'monthly')).toBe(0);
    expect(nominalAnnualToPeriodic(0, 'quarterly')).toBe(0);
    expect(periodicToEffectiveAnnual(0, 'monthly')).toBe(0);
  });
});
