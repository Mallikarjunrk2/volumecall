import { Candle } from "./types";

/**
 * Calculates 50 DMA and 200 DMA for a series of candles.
 * Modifies the candles in-place or returns a new array with calculations.
 * Assumes candles are sorted chronologically (oldest first).
 */
export function calculateMovingAverages(candles: Candle[]): Candle[] {
  return candles.map((candle, idx) => {
    let dma50: number | null = null;
    let dma200: number | null = null;

    if (idx >= 49) {
      let sum50 = 0;
      for (let j = idx - 49; j <= idx; j++) {
        sum50 += candles[j].close;
      }
      dma50 = sum50 / 50;
    }

    if (idx >= 199) {
      let sum200 = 0;
      for (let j = idx - 199; j <= idx; j++) {
        sum200 += candles[j].close;
      }
      dma200 = sum200 / 200;
    }

    return {
      ...candle,
      dma50,
      dma200,
    };
  });
}

/**
 * Helper to find the closest candle within a tolerance threshold (default 15 days).
 */
function findClosestCandle(candles: Candle[], targetDate: Date, maxDiffDays = 15): Candle | null {
  if (candles.length === 0) return null;

  let closest: Candle | null = null;
  let minDiff = Infinity;

  const targetTime = targetDate.getTime();

  for (const candle of candles) {
    const candleTime = new Date(candle.time).getTime();
    const diff = Math.abs(candleTime - targetTime);

    if (diff < minDiff) {
      minDiff = diff;
      closest = candle;
    }
  }

  // Verify within tolerance threshold
  const maxDiffMs = maxDiffDays * 24 * 60 * 60 * 1000;
  if (minDiff > maxDiffMs) {
    return null;
  }

  return closest;
}

export interface CalculatedMetrics {
  dma50: number | null;
  dma200: number | null;
  high52W: number | null;
  low52W: number | null;
  return1M: number | null;
  return6M: number | null;
  return1Y: number | null;
  cagr3Y: number | null;
  cagr5Y: number | null;
  cagr10Y: number | null;
}

/**
 * Calculates returns, CAGRs, and 52-week extremes from a series of daily candles.
 * Assumes candles are sorted chronologically (oldest first).
 */
export function calculateMetrics(candles: Candle[]): CalculatedMetrics {
  const result: CalculatedMetrics = {
    dma50: null,
    dma200: null,
    high52W: null,
    low52W: null,
    return1M: null,
    return6M: null,
    return1Y: null,
    cagr3Y: null,
    cagr5Y: null,
    cagr10Y: null,
  };

  if (candles.length === 0) return result;

  const latestCandle = candles[candles.length - 1];
  const latestPrice = latestCandle.close;

  // Calculate current 50 and 200 DMA
  const processed = calculateMovingAverages(candles);
  const latestProcessed = processed[processed.length - 1];
  result.dma50 = latestProcessed.dma50 || null;
  result.dma200 = latestProcessed.dma200 || null;

  // Calculate 52-Week High & Low
  // 52 weeks is ~250 trading days or 365 calendar days.
  // We'll look at the last 365 calendar days of data.
  const oneYearAgoTime = new Date(latestCandle.time);
  oneYearAgoTime.setFullYear(oneYearAgoTime.getFullYear() - 1);
  const oneYearAgoMs = oneYearAgoTime.getTime();

  let maxPrice = -Infinity;
  let minPrice = Infinity;
  let count52W = 0;

  for (const candle of candles) {
    const time = new Date(candle.time).getTime();
    if (time >= oneYearAgoMs) {
      if (candle.high > maxPrice) maxPrice = candle.high;
      if (candle.low < minPrice) minPrice = candle.low;
      count52W++;
    }
  }

  // Require at least 150 data points to calculate a meaningful 52-week range
  if (count52W >= 150) {
    result.high52W = maxPrice;
    result.low52W = minPrice;
  }

  // Helper dates
  const today = new Date(latestCandle.time);

  const date1M = new Date(today);
  date1M.setMonth(date1M.getMonth() - 1);

  const date6M = new Date(today);
  date6M.setMonth(date6M.getMonth() - 6);

  const date1Y = new Date(today);
  date1Y.setFullYear(date1Y.getFullYear() - 1);

  const date3Y = new Date(today);
  date3Y.setFullYear(date3Y.getFullYear() - 3);

  const date5Y = new Date(today);
  date5Y.setFullYear(date5Y.getFullYear() - 5);

  const date10Y = new Date(today);
  date10Y.setFullYear(date10Y.getFullYear() - 10);

  // Find historical candle values
  const candle1M = findClosestCandle(candles, date1M);
  const candle6M = findClosestCandle(candles, date6M);
  const candle1Y = findClosestCandle(candles, date1Y);
  const candle3Y = findClosestCandle(candles, date3Y);
  const candle5Y = findClosestCandle(candles, date5Y);
  const candle10Y = findClosestCandle(candles, date10Y);

  // 1-Month Return
  if (candle1M && candle1M.close > 0) {
    result.return1M = ((latestPrice - candle1M.close) / candle1M.close) * 100;
  }

  // 6-Month Return
  if (candle6M && candle6M.close > 0) {
    result.return6M = ((latestPrice - candle6M.close) / candle6M.close) * 100;
  }

  // 1-Year Return
  if (candle1Y && candle1Y.close > 0) {
    result.return1Y = ((latestPrice - candle1Y.close) / candle1Y.close) * 100;
  }

  // 3-Year CAGR
  if (candle3Y && candle3Y.close > 0) {
    result.cagr3Y = (Math.pow(latestPrice / candle3Y.close, 1 / 3) - 1) * 100;
  }

  // 5-Year CAGR
  if (candle5Y && candle5Y.close > 0) {
    result.cagr5Y = (Math.pow(latestPrice / candle5Y.close, 1 / 5) - 1) * 100;
  }

  // 10-Year CAGR
  if (candle10Y && candle10Y.close > 0) {
    result.cagr10Y = (Math.pow(latestPrice / candle10Y.close, 1 / 10) - 1) * 100;
  }

  return result;
}

/**
 * Calculates percentage growth between current and previous values.
 * Returns null if either input is missing, or if the previous value is non-positive.
 */
export function calculateGrowth(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous <= 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Calculates CAGR (Compound Annual Growth Rate) between current and previous values over N years.
 * Returns null if either input is missing, or if the ratio/years are non-positive.
 */
export function calculateCAGR(current: number | null, previous: number | null, years: number): number | null {
  if (current === null || previous === null || previous <= 0 || current <= 0 || years <= 0) {
    return null;
  }
  return (Math.pow(current / previous, 1 / years) - 1) * 100;
}

/**
 * Calculates the median of an array of numeric values.
 * Strictly ignores null/NaN values completely. Returns null if no valid numbers remain.
 */
export function calculateMedian(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (valid.length === 0) return null;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

