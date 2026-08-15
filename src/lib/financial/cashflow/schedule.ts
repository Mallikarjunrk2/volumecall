/**
 * CASH FLOW SCHEDULE ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 5 & Section 43
 */

import { CashFlow, CashFlowSchedule } from '../types';
import { summarizeCashFlows } from './payments';

export function createCashFlowSchedule(cashFlows: CashFlow[]): CashFlowSchedule {
  const sorted = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const { totalInvested, totalWithdrawn } = summarizeCashFlows(sorted);

  return {
    cashFlows: sorted,
    totalInvested,
    totalWithdrawn,
  };
}
