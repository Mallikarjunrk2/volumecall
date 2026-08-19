import "server-only";
import { sql } from "@/lib/db";
import { PublicUser, UpsertPublicUserInput } from "./types";
import { ensurePublicUserTables } from "./db-init";
import { normalizeEmail } from "./utils";

export { normalizeEmail };

/**
 * Creates or updates a public user record from Google OAuth login.
 * Guarantees idempotency and prevents duplicate accounts for the same email.
 */
export async function upsertPublicUser(input: UpsertPublicUserInput): Promise<PublicUser> {
  await ensurePublicUserTables();
  const normalizedEmail = normalizeEmail(input.email);

  const rows = await sql`
    INSERT INTO users (
      google_id,
      email,
      name,
      image,
      last_login_at,
      updated_at
    )
    VALUES (
      ${input.googleId || null},
      ${normalizedEmail},
      ${input.name || null},
      ${input.image || null},
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE
    SET
      google_id = COALESCE(EXCLUDED.google_id, users.google_id),
      name = COALESCE(EXCLUDED.name, users.name),
      image = COALESCE(EXCLUDED.image, users.image),
      last_login_at = NOW(),
      updated_at = NOW()
    RETURNING
      id,
      google_id,
      email,
      name,
      image,
      created_at,
      updated_at,
      last_login_at;
  `;

  const row = rows[0];
  return {
    id: row.id,
    google_id: row.google_id,
    email: row.email,
    name: row.name,
    image: row.image,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
    last_login_at: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
  };
}

/**
 * Retrieves a public user by normalized email.
 */
export async function getPublicUserByEmail(email: string): Promise<PublicUser | null> {
  await ensurePublicUserTables();
  const normalizedEmail = normalizeEmail(email);

  const rows = await sql`
    SELECT
      id,
      google_id,
      email,
      name,
      image,
      created_at,
      updated_at,
      last_login_at
    FROM users
    WHERE email = ${normalizedEmail}
    LIMIT 1;
  `;

  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    google_id: row.google_id,
    email: row.email,
    name: row.name,
    image: row.image,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
    last_login_at: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
  };
}

/**
 * Retrieves a public user by ID.
 */
export async function getPublicUserById(id: string): Promise<PublicUser | null> {
  await ensurePublicUserTables();

  const rows = await sql`
    SELECT
      id,
      google_id,
      email,
      name,
      image,
      created_at,
      updated_at,
      last_login_at
    FROM users
    WHERE id = ${id}::uuid
    LIMIT 1;
  `;

  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    google_id: row.google_id,
    email: row.email,
    name: row.name,
    image: row.image,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
    last_login_at: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
  };
}

/**
 * Updates last_login_at timestamp and profile details.
 */
export async function recordPublicUserLogin(
  id: string,
  name?: string | null,
  image?: string | null
): Promise<void> {
  await ensurePublicUserTables();

  await sql`
    UPDATE users
    SET
      name = COALESCE(${name || null}, name),
      image = COALESCE(${image || null}, image),
      last_login_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}::uuid;
  `;
}
