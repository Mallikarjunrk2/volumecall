import "server-only";
import { sql } from "@/lib/db";
import { ensureCmsTables } from "./db-init";
import { CmsUser, CmsUserInput, CmsUserRole } from "./types";
import { normalizeEmail } from "./auth";

async function checkInit() {
  await ensureCmsTables();
}

export async function getCmsUserByEmail(email: string): Promise<CmsUser | null> {
  await checkInit();
  const cleanEmail = normalizeEmail(email);
  const rows = await sql`
    SELECT * FROM cms_users
    WHERE email = ${cleanEmail}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return rows[0] as CmsUser;
}

export async function getCmsUserById(id: string): Promise<CmsUser | null> {
  await checkInit();
  const rows = await sql`
    SELECT * FROM cms_users
    WHERE id = ${id}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return rows[0] as CmsUser;
}

export async function listCmsUsers(): Promise<CmsUser[]> {
  await checkInit();
  const rows = await sql`
    SELECT * FROM cms_users
    ORDER BY created_at DESC;
  `;
  return rows as CmsUser[];
}

export async function countActiveSuperAdmins(): Promise<number> {
  await checkInit();
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM cms_users
    WHERE role = 'SUPER_ADMIN' AND is_active = TRUE;
  `;
  return rows[0]?.count ?? 0;
}

export async function createCmsUser(input: CmsUserInput): Promise<CmsUser> {
  await checkInit();
  const cleanEmail = normalizeEmail(input.email);

  const rows = await sql`
    INSERT INTO cms_users (
      email, name, role, is_active, created_at, updated_at
    ) VALUES (
      ${cleanEmail}, ${input.name || null}, ${input.role},
      ${input.is_active !== undefined ? input.is_active : true},
      NOW(), NOW()
    )
    RETURNING *;
  `;
  return rows[0] as CmsUser;
}

export async function updateCmsUserRole(id: string, role: CmsUserRole): Promise<CmsUser> {
  await checkInit();
  const rows = await sql`
    UPDATE cms_users
    SET role = ${role}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *;
  `;
  if (rows.length === 0) throw new Error("CMS user not found.");
  return rows[0] as CmsUser;
}

export async function updateCmsUserStatus(id: string, isActive: boolean): Promise<CmsUser> {
  await checkInit();
  const rows = await sql`
    UPDATE cms_users
    SET is_active = ${isActive}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *;
  `;
  if (rows.length === 0) throw new Error("CMS user not found.");
  return rows[0] as CmsUser;
}

export async function deleteCmsUser(id: string): Promise<boolean> {
  await checkInit();
  const result = await sql`
    DELETE FROM cms_users
    WHERE id = ${id}
    RETURNING id;
  `;
  return result.length > 0;
}

export async function recordUserLogin(
  id: string,
  name?: string | null,
  image?: string | null
): Promise<void> {
  await checkInit();
  await sql`
    UPDATE cms_users
    SET
      last_login_at = NOW(),
      name = COALESCE(${name || null}, name),
      image = COALESCE(${image || null}, image),
      updated_at = NOW()
    WHERE id = ${id};
  `;
}

export async function bootstrapSuperAdmin(
  email: string,
  name?: string | null,
  image?: string | null
): Promise<CmsUser> {
  await checkInit();
  const cleanEmail = normalizeEmail(email);

  const rows = await sql`
    INSERT INTO cms_users (
      email, name, image, role, is_active, created_at, updated_at, last_login_at
    ) VALUES (
      ${cleanEmail}, ${name || 'Administrator'}, ${image || null}, 'SUPER_ADMIN', TRUE, NOW(), NOW(), NOW()
    )
    ON CONFLICT (email) DO UPDATE
    SET
      role = 'SUPER_ADMIN',
      is_active = TRUE,
      last_login_at = NOW(),
      updated_at = NOW()
    RETURNING *;
  `;
  return rows[0] as CmsUser;
}
