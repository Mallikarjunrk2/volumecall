/**
 * CASH FLOW PAYMENTS ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 5 & Section 42
 */

import { PaymentTiming, CashFlow } from '../types';

/**
 * Gets payment timing multiplier for future value annuity calculations.
 * Beginning of period = (1 + periodicRate)
 * End of period = 1
 */
export function getPaymentTimingMultiplier(timing: PaymentTiming, periodicRate: number): number {
  return timing === 'beginning' ? 1 + periodicRate : 1;
}

/**
 * Validates and normalizes cash flow sign according to Section 42:
 * Investment / money going IN = Negative (-)
 * Withdrawal / dividend / payout / current value = Positive (+)
 */
export function normalizeCashFlowSign(amount: number, type: 'contribution' | 'withdrawal' | 'valuation' | 'dividend'): number {
  const absAmount = Math.abs(amount);
  if (type === 'contribution') {
    return -absAmount;
  }
  return absAmount;
}

/**
 * Sums total contributions (negative cash flows) and total withdrawals (positive cash flows).
 */
export function summarizeCashFlows(cashFlows: CashFlow[]): { totalInvested: number; totalWithdrawn: number } {
  let totalInvested = 0;
  let totalWithdrawn = 0;

  for (const cf of cashFlows) {
    if (cf.amount < 0) {
      totalInvested += Math.abs(cf.amount);
    } else if (cf.amount > 0) {
      totalWithdrawn += cf.amount;
    }
  }

  return { totalInvested, totalWithdrawn };
}
