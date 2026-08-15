import { describe, it, expect } from 'vitest';
import { calculateEmi } from '../../src/lib/financial/loans/emi';
import { generateAmortizationSchedule } from '../../src/lib/financial/loans/amortization';
import { calculatePrepayment } from '../../src/lib/financial/loans/prepayment';

describe('Loans & Amortization Engine', () => {
  it('calculates EMI based on spec example', () => {
    // Spec Example: Loan = 50,00,000, Annual rate = 8%, Tenure = 20 years (240 months)
    // EMI = 5000000 * (0.08/12) * (1 + 0.08/12)^240 / ((1 + 0.08/12)^240 - 1) ≈ 41822.00
    const emiRes = calculateEmi(5000000, 0.08, 240);
    expect(emiRes.monthlyEmi).toBeCloseTo(41822.00, 1);
    expect(emiRes.totalPayment).toBeGreaterThan(5000000);
  });

  it('handles zero-interest loans in EMI calculation', () => {
    const emiRes = calculateEmi(120000, 0, 12);
    expect(emiRes.monthlyEmi).toBe(10000);
    expect(emiRes.totalInterest).toBe(0);
    expect(emiRes.totalPayment).toBe(120000);
  });

  it('generates consistent amortization schedule month-by-month ending at zero balance', () => {
    const schedule = generateAmortizationSchedule(100000, 0.10, 12);
    expect(schedule.rows.length).toBe(12);
    expect(schedule.rows[0].openingBalance).toBe(100000);
    expect(schedule.rows[11].closingBalance).toBe(0);

    // Sum of interest + principal should equal total EMI paid
    const totalEmiSum = schedule.rows.reduce((sum, r) => sum + r.emi, 0);
    expect(schedule.totalPayment).toBeCloseTo(totalEmiSum, 2);
  });

  it('calculates prepayment tenure reduction correctly', () => {
    // Principal 50,00,000, 8%, 240 months, prepay 5,00,000
    const prepayRes = calculatePrepayment(5000000, 0.08, 240, 500000, 'reduceTenure');
    expect(prepayRes.interestSavings).toBeGreaterThan(0);
    expect(prepayRes.tenureReductionMonths).toBeGreaterThan(0);
    expect(prepayRes.newSchedule.rows.length).toBeLessThan(240);
  });

  it('calculates prepayment EMI reduction correctly', () => {
    const prepayRes = calculatePrepayment(5000000, 0.08, 240, 500000, 'reduceEmi');
    expect(prepayRes.interestSavings).toBeGreaterThan(0);
    expect(prepayRes.newMonthlyEmi!).toBeLessThan(prepayRes.originalSchedule.rows[0].emi);
  });
});
