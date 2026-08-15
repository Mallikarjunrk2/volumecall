/**
 * TIME-WEIGHTED RETURN (TWR) ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 27 & Section 13 & Section 49
 */

import { TwrResult, TwrSubPeriod } from '../types';

/**
 * Calculates Time-Weighted Return (TWR) across sub-periods.
 * TWR measures strategy performance independently of investor cash-flow timing.
 *
 * For each sub-period:
 * subPeriodReturn = (endValueBeforeCashFlow - startValue) / startValue
 * Total TWR = PROD(1 + subPeriodReturn_k) - 1
 */
export function calculateTwr(subPeriods: Array<{
  startDate: Date;
  endDate: Date;
  startValue: number;
  endValueBeforeCashFlow: number;
  cashFlow?: number;
}>): TwrResult {
  if (!Array.isArray(subPeriods) || subPeriods.length === 0) {
    throw new Error('TWR calculation requires at least one sub-period.');
  }

  let cumulativeFactor = 1.0;
  const processedPeriods: TwrSubPeriod[] = [];

  for (const period of subPeriods) {
    if (period.startValue <= 0) {
      throw new Error('Start value of sub-period must be greater than zero.');
    }

    const subReturn = (period.endValueBeforeCashFlow - period.startValue) / period.startValue;
    cumulativeFactor *= (1 + subReturn);

    processedPeriods.push({
      startDate: period.startDate,
      endDate: period.endDate,
      startValue: period.startValue,
      endValueBeforeCashFlow: period.endValueBeforeCashFlow,
      cashFlow: period.cashFlow ?? 0,
      subPeriodReturn: subReturn,
    });
  }

  const twr = cumulativeFactor - 1.0;

  return {
    twr,
    twrPercentage: twr * 100,
    subPeriods: processedPeriods,
  };
}
