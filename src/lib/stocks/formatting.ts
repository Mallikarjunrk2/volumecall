/**
 * Format numeric value as INR currency string.
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const hasDecimals = value % 1 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Format value as percentage with '+' prefix for positive values.
 */
export function formatPercent(value: number | null | undefined, precision = 2): string {
  if (value === null || value === undefined) return "—";
  const prefix = value > 0 ? "+" : "";
  // Check if it's an integer percentage or float
  const formattedVal = value % 1 === 0 ? value.toFixed(0) : value.toFixed(precision);
  return `${prefix}${formattedVal}%`;
}

/**
 * Format volume in Indian locale format (e.g. 12,34,567).
 */
export function formatVolume(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * Format a general number using Indian locale formatting.
 */
export function formatIndianNumber(value: number | null | undefined, forceDecimals = false): string {
  if (value === null || value === undefined) return "—";
  const hasDecimals = forceDecimals || (value % 1 !== 0);
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Parse and format a date string to "DD MMM YYYY" format explicitly.
 * Handles Indian date format string "DD-MM-YYYY" and ISO format correctly.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";

  let date: Date;

  const dmyMatch = String(dateStr).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed month
    const year = parseInt(dmyMatch[3], 10);
    date = new Date(year, month, day);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return dateStr;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
