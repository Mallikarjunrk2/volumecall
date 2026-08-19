/**
 * Normalizes email by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
