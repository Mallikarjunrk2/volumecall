/**
 * CASH FLOW DATES ENGINE
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 5 & Section 41
 */

/**
 * Calculates day fraction between two dates using 365-day convention.
 * Formula: (date_i - date_0) / 365 (in days)
 */
export function calculateDayFraction365(d0: Date, d1: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = (d1.getTime() - d0.getTime()) / msPerDay;
  return diffDays / 365;
}

/**
 * Generates an array of periodic dates (e.g. monthly, quarterly, annual) starting from a base date.
 */
export function generatePeriodicDates(
  startDate: Date,
  totalPeriods: number,
  monthsPerPeriod: number = 1
): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < totalPeriods; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i * monthsPerPeriod);
    dates.push(d);
  }
  return dates;
}
