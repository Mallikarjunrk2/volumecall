import "server-only";
import { sql } from "@/lib/db";
import { ensurePublicUserTables } from "./db-init";

export const ANONYMOUS_STOCK_RESEARCH_LIMIT = 3;
export const VC_ANON_COOKIE_NAME = "vc_anon_id";

export interface ResearchGateResult {
  allowed: boolean;
  count: number;
  remaining: number;
  anonId: string;
  isNewAnonCookie: boolean;
}

/**
 * Normalizes stock ticker symbol consistently.
 */
export function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

/**
 * Evaluates whether a stock research request is allowed based on authentication
 * or the 3-unique-stock limit for anonymous guests.
 * Concurrency-safe atomic checking using Neon PostgreSQL.
 */
export async function checkOrRecordStockResearch(
  symbol: string,
  reqCookieAnonId?: string | null,
  authUserId?: string | null
): Promise<ResearchGateResult> {
  // 1. Authenticated Google users bypass all anonymous research quotas
  if (authUserId) {
    return {
      allowed: true,
      count: 0,
      remaining: 999,
      anonId: "",
      isNewAnonCookie: false,
    };
  }

  try {
    await ensurePublicUserTables();

  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) {
    return {
      allowed: false,
      count: 0,
      remaining: 0,
      anonId: reqCookieAnonId || "",
      isNewAnonCookie: false,
    };
  }

  // 2. Resolve or generate cryptographic anonymous visitor ID
  let anonId = reqCookieAnonId?.trim() || "";
  let isNewAnonCookie = false;

  if (!anonId) {
    anonId = crypto.randomUUID();
    isNewAnonCookie = true;
  }

  // 3. Check if this exact stock was already researched by this anonymous visitor
  const existingRows = await sql`
    SELECT 1 FROM anonymous_stock_research
    WHERE anon_id = ${anonId} AND symbol = ${normalizedSymbol}
    LIMIT 1;
  `;

  if (existingRows.length > 0) {
    // Already researched: does NOT consume additional quota
    const countRows = await sql`
      SELECT COUNT(DISTINCT symbol) as count
      FROM anonymous_stock_research
      WHERE anon_id = ${anonId};
    `;
    const count = Number(countRows[0]?.count || 0);

    return {
      allowed: true,
      count,
      remaining: Math.max(0, ANONYMOUS_STOCK_RESEARCH_LIMIT - count),
      anonId,
      isNewAnonCookie,
    };
  }

  // 4. New stock for this visitor: Check current unique stock count
  const countRows = await sql`
    SELECT COUNT(DISTINCT symbol) as count
    FROM anonymous_stock_research
    WHERE anon_id = ${anonId};
  `;
  const currentCount = Number(countRows[0]?.count || 0);

  if (currentCount >= ANONYMOUS_STOCK_RESEARCH_LIMIT) {
    return {
      allowed: false,
      count: currentCount,
      remaining: 0,
      anonId,
      isNewAnonCookie,
    };
  }

  // 5. Attempt atomic insertion of new symbol
  await sql`
    INSERT INTO anonymous_stock_research (anon_id, symbol)
    VALUES (${anonId}, ${normalizedSymbol})
    ON CONFLICT (anon_id, symbol) DO NOTHING;
  `;

  // 6. Concurrency safety: Re-verify total unique symbol count
  const recheckRows = await sql`
    SELECT COUNT(DISTINCT symbol) as count
    FROM anonymous_stock_research
    WHERE anon_id = ${anonId};
  `;
  const newCount = Number(recheckRows[0]?.count || 0);

  if (newCount > ANONYMOUS_STOCK_RESEARCH_LIMIT) {
    // Concurrent request conflict: rollback this insertion to strictly enforce the limit
    await sql`
      DELETE FROM anonymous_stock_research
      WHERE anon_id = ${anonId} AND symbol = ${normalizedSymbol};
    `;

    return {
      allowed: false,
      count: ANONYMOUS_STOCK_RESEARCH_LIMIT,
      remaining: 0,
      anonId,
      isNewAnonCookie,
    };
  }

  return {
    allowed: true,
    count: newCount,
    remaining: Math.max(0, ANONYMOUS_STOCK_RESEARCH_LIMIT - newCount),
    anonId,
    isNewAnonCookie,
  };
  } catch (error) {
    console.error("[Research Gate Error - DB fallback]:", error);
    return {
      allowed: true,
      count: 0,
      remaining: 999,
      anonId: reqCookieAnonId || "",
      isNewAnonCookie: false,
    };
  }
}
