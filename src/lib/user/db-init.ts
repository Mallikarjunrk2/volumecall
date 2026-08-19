import "server-only";
import { sql } from "@/lib/db";

const PUBLIC_USERS_ADVISORY_LOCK_ID = 839174099;

let isPublicUsersInitialized = false;
let publicUsersInitPromise: Promise<void> | null = null;

async function checkUsersTableExistence(): Promise<boolean> {
  try {
    const res = await sql`
      SELECT (
        to_regclass('public.users') IS NOT NULL AND
        to_regclass('public.anonymous_stock_research') IS NOT NULL AND
        to_regclass('public.user_watchlist') IS NOT NULL
      ) as exists;
    `;
    return Boolean(res[0]?.exists);
  } catch {
    return false;
  }
}

async function runPublicUsersInitialization(): Promise<void> {
  try {
    // 1. Acquire transaction/session advisory lock in PostgreSQL
    await sql`SELECT pg_advisory_lock(${PUBLIC_USERS_ADVISORY_LOCK_ID});`;

    try {
      // 2. Create public users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          google_id VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          image TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
        );
      `;

      // 3. Create anonymous stock research tracking table
      await sql`
        CREATE TABLE IF NOT EXISTS anonymous_stock_research (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          anon_id VARCHAR(255) NOT NULL,
          symbol VARCHAR(20) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_anon_symbol UNIQUE(anon_id, symbol)
        );
      `;

      // 4. Create public user watchlist table
      await sql`
        CREATE TABLE IF NOT EXISTS user_watchlist (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          symbol VARCHAR(20) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_user_symbol UNIQUE(user_id, symbol)
        );
      `;

      // 5. Create performance indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_anon_stock_research_anon_id ON anonymous_stock_research(anon_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);`;
    } finally {
      // 4. Always release advisory lock
      await sql`SELECT pg_advisory_unlock(${PUBLIC_USERS_ADVISORY_LOCK_ID});`.catch((unlockErr) => {
        console.error("[Public Users DB Unlock Error]:", unlockErr);
      });
    }
  } catch (error) {
    console.error("[Public Users DB Init Error]:", error);
    throw error;
  }
}

/**
 * Idempotently and safely initializes the public users database table.
 * Uses advisory locking and fast regclass check for cold starts.
 */
export async function ensurePublicUserTables(): Promise<void> {
  if (isPublicUsersInitialized) return;
  if (!publicUsersInitPromise) {
    publicUsersInitPromise = (async () => {
      const exists = await checkUsersTableExistence();
      if (exists) {
        isPublicUsersInitialized = true;
        return;
      }
      await runPublicUsersInitialization();
      isPublicUsersInitialized = true;
    })().catch((err) => {
      publicUsersInitPromise = null;
      throw err;
    });
  }
  return publicUsersInitPromise;
}
