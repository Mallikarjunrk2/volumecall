import "server-only";
import { sql } from "@/lib/db";
import { ensurePublicUserTables } from "./db-init";
import { normalizeSymbol } from "./research-gate-service";

/**
 * Retrieves all saved stock symbols in a public user's watchlist.
 */
export async function getUserWatchlist(userId: string): Promise<string[]> {
  await ensurePublicUserTables();
  if (!userId) return [];

  const rows = await sql`
    SELECT symbol
    FROM user_watchlist
    WHERE user_id = ${userId}::uuid
    ORDER BY created_at DESC;
  `;

  return rows.map((r) => r.symbol);
}

/**
 * Adds a stock symbol to a public user's watchlist.
 * Uses ON CONFLICT DO NOTHING to prevent duplicate entries.
 */
export async function addToUserWatchlist(userId: string, symbol: string): Promise<boolean> {
  await ensurePublicUserTables();
  const normalized = normalizeSymbol(symbol);
  if (!userId || !normalized) return false;

  await sql`
    INSERT INTO user_watchlist (user_id, symbol)
    VALUES (${userId}::uuid, ${normalized})
    ON CONFLICT (user_id, symbol) DO NOTHING;
  `;

  return true;
}

/**
 * Removes a stock symbol from a public user's watchlist.
 */
export async function removeFromUserWatchlist(userId: string, symbol: string): Promise<boolean> {
  await ensurePublicUserTables();
  const normalized = normalizeSymbol(symbol);
  if (!userId || !normalized) return false;

  await sql`
    DELETE FROM user_watchlist
    WHERE user_id = ${userId}::uuid AND symbol = ${normalized};
  `;

  return true;
}

/**
 * Checks whether a specific stock symbol is in a public user's watchlist.
 */
export async function isSymbolInUserWatchlist(userId: string, symbol: string): Promise<boolean> {
  await ensurePublicUserTables();
  const normalized = normalizeSymbol(symbol);
  if (!userId || !normalized) return false;

  const rows = await sql`
    SELECT 1
    FROM user_watchlist
    WHERE user_id = ${userId}::uuid AND symbol = ${normalized}
    LIMIT 1;
  `;

  return rows.length > 0;
}
