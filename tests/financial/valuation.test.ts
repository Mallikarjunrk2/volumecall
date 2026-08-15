import { describe, it, expect } from 'vitest';
import { calculateDcf } from '../../src/lib/financial/valuation/dcf';
import { calculateReverseDcf } from '../../src/lib/financial/valuation/reverseDcf';
import { calculatePeValuation, calculatePegRatio } from '../../src/lib/financial/valuation/pe';
import { calculateEvEbitdaValuation } from '../../src/lib/financial/valuation/evEbitda';
import { calculateDdmValuation } from '../../src/lib/financial/valuation/ddm';

describe('Valuation Engine', () => {
  it('calculates DCF valuation accurately', () => {
    // Forecast FCFs = [100, 110, 121, 133.1, 146.41], WACC = 10%, terminal growth = 3%
    const fcfs = [100, 110, 121, 133.1, 146.41];
    const dcfRes = calculateDcf(fcfs, 0.10, 0.03, 100, 10);
    expect(dcfRes.enterpriseValue).toBeGreaterThan(1000);
    expect(dcfRes.equityValue).toBe(dcfRes.enterpriseValue - 100);
    expect(dcfRes.fairValuePerShare).toBe(dcfRes.equityValue / 10);
  });

  it('throws error when WACC <= terminal growth rate in DCF', () => {
    expect(() => calculateDcf([100, 110], 0.03, 0.03)).toThrow();
    expect(() => calculateDcf([100, 110], 0.02, 0.03)).toThrow();
  });

  it('solves Reverse DCF for implied growth rate', () => {
    // Base FCF 100, Target Equity Value 2000, WACC 10%, terminal growth 3%
    const revRes = calculateReverseDcf(100, 2000, 0.10, 5, 0.03);
    expect(revRes.impliedGrowthRate).not.toBeNull();
    expect(revRes.calculatedEquityValue).toBeCloseTo(2000, 1);
  });

  it('calculates P/E valuation based on spec example', () => {
    // Spec Example: Expected EPS = 100, Fair P/E = 20 -> Fair Value = 2,000
    const peRes = calculatePeValuation(100, 20);
    expect(peRes.fairValue).toBe(2000);
  });

  it('calculates PEG ratio based on spec example', () => {
    // Spec Example: P/E = 20, Growth = 10% -> PEG = 2
    const pegRes = calculatePegRatio(20, 10);
    expect(pegRes.pegRatio).toBe(2);
  });

  it('calculates EV/EBITDA valuation', () => {
    // EBITDA = 500, Multiple = 10 -> EV = 5000, NetDebt = 500 -> Equity Value = 4500
    const evRes = calculateEvEbitdaValuation(500, 10, 500, 100);
    expect(evRes.enterpriseValue).toBe(5000);
    expect(evRes.equityValue).toBe(4500);
    expect(evRes.fairValuePerShare).toBe(45);
  });

  it('calculates DDM valuation based on Gordon Growth model', () => {
    // Current dividend D0 = 10, growth g = 5%, Cost of Equity Ke = 10%
    // D1 = 10.5, Value = 10.5 / (0.10 - 0.05) = 210
    const ddmRes = calculateDdmValuation(10, 0.05, 0.10);
    expect(ddmRes.d1).toBe(10.5);
    expect(ddmRes.fairValue).toBe(210);
  });

  it('throws error when Ke <= g in DDM valuation', () => {
    expect(() => calculateDdmValuation(10, 0.10, 0.10)).toThrow();
  });
});
