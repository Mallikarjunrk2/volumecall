/**
 * EMERGENCY FUND CALCULATOR ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 46 (Planning)
 */

export interface EmergencyFundResult {
  monthlyExpenses: number;
  targetMonths: number;
  requiredEmergencyFund: number;
  currentSavings: number;
  additionalSavingsNeeded: number;
}

/**
 * Calculates required emergency fund based on monthly expenses and months of coverage.
 *
 * @param monthlyExpenses - Monthly essential living expenses
 * @param targetMonths - Months of expense coverage desired (default 6)
 * @param currentSavings - Current liquid emergency savings already set aside (default 0)
 */
export function calculateEmergencyFund(
  monthlyExpenses: number,
  targetMonths: number = 6,
  currentSavings: number = 0
): EmergencyFundResult {
  if (monthlyExpenses < 0) throw new Error('Monthly expenses cannot be negative.');
  if (targetMonths <= 0) throw new Error('Target months must be greater than zero.');

  const requiredEmergencyFund = monthlyExpenses * targetMonths;
  const additionalSavingsNeeded = Math.max(0, requiredEmergencyFund - currentSavings);

  return {
    monthlyExpenses,
    targetMonths,
    requiredEmergencyFund,
    currentSavings,
    additionalSavingsNeeded,
  };
}
