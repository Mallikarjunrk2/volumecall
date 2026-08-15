/**
 * VALIDATION ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 18 & 44
 */

import { CashFlow, ValidationResult, ValidationError } from '../types';

export function validatePositiveNumber(value: number, fieldName: string): ValidationError | null {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return { code: 'INVALID_NUMBER', message: `${fieldName} must be a valid number.`, field: fieldName };
  }
  if (value < 0) {
    return { code: 'NEGATIVE_VALUE', message: `${fieldName} cannot be negative.`, field: fieldName };
  }
  return null;
}

export function validateNonZeroPositiveNumber(value: number, fieldName: string): ValidationError | null {
  const err = validatePositiveNumber(value, fieldName);
  if (err) return err;
  if (value === 0) {
    return { code: 'ZERO_VALUE', message: `${fieldName} must be greater than zero.`, field: fieldName };
  }
  return null;
}

export function validateRate(rate: number, fieldName: string = 'Rate'): ValidationError | null {
  if (typeof rate !== 'number' || isNaN(rate) || !isFinite(rate)) {
    return { code: 'INVALID_RATE', message: `${fieldName} must be a valid number.`, field: fieldName };
  }
  if (rate < -1) {
    return { code: 'RATE_TOO_LOW', message: `${fieldName} cannot be less than -100% (-1).`, field: fieldName };
  }
  return null;
}

export function validateCashFlowsForXirr(cashFlows: CashFlow[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(cashFlows) || cashFlows.length < 2) {
    errors.push({
      code: 'INSUFFICIENT_CASH_FLOWS',
      message: 'XIRR requires at least 2 cash flows.',
    });
    return { isValid: false, errors };
  }

  let hasPositive = false;
  let hasNegative = false;

  for (let i = 0; i < cashFlows.length; i++) {
    const cf = cashFlows[i];
    if (!cf || !(cf.date instanceof Date) || isNaN(cf.date.getTime())) {
      errors.push({
        code: 'INVALID_DATE',
        message: `Cash flow at index ${i} has an invalid date.`,
      });
    }
    if (typeof cf.amount !== 'number' || isNaN(cf.amount) || !isFinite(cf.amount)) {
      errors.push({
        code: 'INVALID_AMOUNT',
        message: `Cash flow at index ${i} has an invalid amount.`,
      });
    }
    if (cf.amount > 0) hasPositive = true;
    if (cf.amount < 0) hasNegative = true;
  }

  if (!hasPositive || !hasNegative) {
    errors.push({
      code: 'XIRR_SIGN_MISMATCH',
      message: 'XIRR requires at least one positive cash flow (payout/value) and at least one negative cash flow (investment).',
    });
  }

  return { isValid: errors.length === 0, errors };
}

export function validateWaccAndGrowth(wacc: number, g: number): ValidationResult {
  const errors: ValidationError[] = [];

  const waccErr = validateRate(wacc, 'WACC');
  if (waccErr) errors.push(waccErr);

  const gErr = validateRate(g, 'Terminal Growth (g)');
  if (gErr) errors.push(gErr);

  if (wacc <= g) {
    errors.push({
      code: 'WACC_LESS_THAN_GROWTH',
      message: 'WACC must be strictly greater than terminal growth rate (g).',
    });
  }

  return { isValid: errors.length === 0, errors };
}

export function validateKeAndGrowth(ke: number, g: number): ValidationResult {
  const errors: ValidationError[] = [];

  const keErr = validateRate(ke, 'Cost of Equity (Ke)');
  if (keErr) errors.push(keErr);

  const gErr = validateRate(g, 'Dividend Growth (g)');
  if (gErr) errors.push(gErr);

  if (ke <= g) {
    errors.push({
      code: 'KE_LESS_THAN_GROWTH',
      message: 'Cost of equity (Ke) must be strictly greater than long-term dividend growth rate (g).',
    });
  }

  return { isValid: errors.length === 0, errors };
}
