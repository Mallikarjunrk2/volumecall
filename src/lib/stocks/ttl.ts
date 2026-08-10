export const SECTION_TTL_DAYS = {
  PEERS: 7,
  QUARTERLY_RESULTS: 7,
  PROFIT_LOSS: 7,
  BALANCE_SHEET: 90,
  CASH_FLOW: 90,
  SHAREHOLDING: 7,
  DOCUMENTS: 30,
  RATIOS: 1,
};

/**
 * Calculates the next refresh expiration date boundary based on:
 * - retrievedAt Date
 * - TTL in calendar days
 * - Fixed 09:15:00 Asia/Kolkata (IST) daily boundary
 * 
 * Flow:
 * Monday 1:00 PM IST retrieved (with 1-day TTL)
 * -> Expires Tuesday 09:15 AM IST (Not Monday 1:00 PM + 24 hours)
 */
export function getNextRefreshBoundary(retrievedAt: Date, ttlDays: number): Date {
  // IST offset is UTC +5:30 (No DST in India)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  
  // Shift timestamp forward by 5.5 hours to align date manipulation with local IST calendar dates
  const retrievedAtIst = new Date(retrievedAt.getTime() + IST_OFFSET);

  const boundaryIst = new Date(retrievedAtIst);
  boundaryIst.setUTCHours(9, 15, 0, 0);

  // If the retrieval happened before 9:15 AM IST today, the reference baseline boundary is 9:15 AM yesterday
  if (retrievedAtIst.getTime() < boundaryIst.getTime()) {
    boundaryIst.setUTCDate(boundaryIst.getUTCDate() - 1);
  }

  // Shift boundary forward by the configured TTL calendar days
  boundaryIst.setUTCDate(boundaryIst.getUTCDate() + ttlDays);

  // Shift timestamp back to absolute UTC before returning
  return new Date(boundaryIst.getTime() - IST_OFFSET);
}

/**
 * Returns true if a retrievedAt timestamp is fresh according to the configured TTL and daily boundaries.
 */
export function isSectionFresh(retrievedAt: Date | string | null | undefined, ttlDays: number): boolean {
  if (!retrievedAt) return false;
  const d = typeof retrievedAt === "string" ? new Date(retrievedAt) : retrievedAt;
  if (isNaN(d.getTime())) return false;
  
  const expiry = getNextRefreshBoundary(d, ttlDays);
  return Date.now() < expiry.getTime();
}
