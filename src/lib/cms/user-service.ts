import "server-only";
import { sql } from "@/lib/db";
import { ensureCmsTables } from "./db-init";
import { CmsUser, CmsUserInput, CmsUserRole, UnifiedUserInput } from "./types";
import { normalizeEmail } from "./auth";

// In normal runtime, CMS tables exist permanently in PostgreSQL.
// checkInit is made a zero-overhead no-op so queries execute directly on first load.
async function checkInit(): Promise<void> {
  // No-op for maximum query performance
}

export async function getCmsUserByEmail(email: string): Promise<CmsUser | null> {
  await checkInit();
  const cleanEmail = normalizeEmail(email);
  const rows = await sql`
    SELECT 
      u.*,
      au.name as author_name,
      au.slug as author_slug,
      au.role as author_role,
      au.bio as author_bio,
      au.avatar_url as author_avatar,
      au.is_active as author_is_active,
      (SELECT COUNT(*)::int FROM articles a WHERE a.author_id = au.id) as author_article_count
    FROM cms_users u
    LEFT JOIN authors au ON u.author_id = au.id
    WHERE u.email = ${cleanEmail}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return rows[0] as CmsUser;
}

export async function getCmsUserById(id: string): Promise<CmsUser | null> {
  await checkInit();
  const rows = await sql`
    SELECT 
      u.*,
      au.name as author_name,
      au.slug as author_slug,
      au.role as author_role,
      au.bio as author_bio,
      au.avatar_url as author_avatar,
      au.is_active as author_is_active,
      (SELECT COUNT(*)::int FROM articles a WHERE a.author_id = au.id) as author_article_count
    FROM cms_users u
    LEFT JOIN authors au ON u.author_id = au.id
    WHERE u.id = ${id}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return rows[0] as CmsUser;
}

export async function listCmsUsers(): Promise<CmsUser[]> {
  await checkInit();
  const rows = await sql`
    SELECT 
      u.*,
      au.name as author_name,
      au.slug as author_slug,
      au.role as author_role,
      au.bio as author_bio,
      au.avatar_url as author_avatar,
      au.is_active as author_is_active,
      (SELECT COUNT(*)::int FROM articles a WHERE a.author_id = au.id) as author_article_count
    FROM cms_users u
    LEFT JOIN authors au ON u.author_id = au.id
    ORDER BY u.created_at DESC;
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
      email, name, role, author_id, is_active, created_at, updated_at
    ) VALUES (
      ${cleanEmail}, ${input.name || null}, ${input.role}, ${input.author_id || null},
      ${input.is_active !== undefined ? input.is_active : true},
      NOW(), NOW()
    )
    RETURNING id;
  `;
  const user = await getCmsUserById(rows[0].id);
  if (!user) throw new Error("Failed to create CMS user.");
  return user;
}

export async function createUnifiedCmsUser(input: UnifiedUserInput): Promise<CmsUser> {
  await checkInit();
  const cleanEmail = normalizeEmail(input.email);

  let finalAuthorId: string | null = null;

  if (input.author_mode === "LINK_EXISTING" && input.existing_author_id) {
    finalAuthorId = input.existing_author_id;
  } else if (input.author_mode === "CREATE_NEW") {
    const authorName = input.author_name?.trim();
    const authorSlug = input.author_slug?.trim();
    const authorRole = input.author_role?.trim();
    if (!authorName || !authorSlug || !authorRole) {
      throw new Error("Author Display Name, Slug, and Professional Title are required to create a profile.");
    }
    const existingSlug = await sql`SELECT id FROM authors WHERE slug = ${authorSlug} LIMIT 1;`;
    if (existingSlug.length > 0) {
      throw new Error(`An author profile with slug "${authorSlug}" already exists.`);
    }
    const createdAuthorRows = await sql`
      INSERT INTO authors (
        name, slug, role, bio, avatar_url, is_active, created_at, updated_at
      ) VALUES (
        ${authorName}, ${authorSlug}, ${authorRole},
        ${input.author_bio?.trim() || null}, ${input.author_avatar?.trim() || null},
        ${input.author_is_active !== false}, NOW(), NOW()
      )
      RETURNING id;
    `;
    finalAuthorId = createdAuthorRows[0].id;
  }

  const rows = await sql`
    INSERT INTO cms_users (
      email, name, role, author_id, is_active, created_at, updated_at
    ) VALUES (
      ${cleanEmail}, ${input.name?.trim() || null}, ${input.role}, ${finalAuthorId},
      ${input.is_active !== undefined ? input.is_active : true},
      NOW(), NOW()
    )
    RETURNING id;
  `;

  const created = await getCmsUserById(rows[0].id);
  if (!created) throw new Error("Failed to retrieve created user.");
  return created;
}

export async function updateUnifiedCmsUser(input: UnifiedUserInput): Promise<CmsUser> {
  await checkInit();
  if (!input.id) throw new Error("User ID is required for update.");

  const currentUser = await getCmsUserById(input.id);
  if (!currentUser) throw new Error("CMS user not found.");

  let finalAuthorId = currentUser.author_id;

  if (input.author_mode === "NONE") {
    finalAuthorId = null;
  } else if (input.author_mode === "LINK_EXISTING") {
    if (!input.existing_author_id) throw new Error("Please select an existing author profile to link.");
    finalAuthorId = input.existing_author_id;
  } else if (input.author_mode === "CREATE_NEW") {
    const authorName = input.author_name?.trim();
    const authorSlug = input.author_slug?.trim();
    const authorRole = input.author_role?.trim();
    if (!authorName || !authorSlug || !authorRole) {
      throw new Error("Author Display Name, Slug, and Professional Title are required to create a profile.");
    }
    const existingSlug = await sql`SELECT id FROM authors WHERE slug = ${authorSlug} LIMIT 1;`;
    if (existingSlug.length > 0) {
      throw new Error(`An author profile with slug "${authorSlug}" already exists.`);
    }
    const createdAuthorRows = await sql`
      INSERT INTO authors (
        name, slug, role, bio, avatar_url, is_active, created_at, updated_at
      ) VALUES (
        ${authorName}, ${authorSlug}, ${authorRole},
        ${input.author_bio?.trim() || null}, ${input.author_avatar?.trim() || null},
        ${input.author_is_active !== false}, NOW(), NOW()
      )
      RETURNING id;
    `;
    finalAuthorId = createdAuthorRows[0].id;
  } else if (input.author_mode === "UPDATE_EXISTING" && currentUser.author_id) {
    const authorName = input.author_name?.trim();
    const authorSlug = input.author_slug?.trim();
    const authorRole = input.author_role?.trim();
    if (!authorName || !authorSlug || !authorRole) {
      throw new Error("Author Display Name, Slug, and Professional Title are required.");
    }
    const slugConflict = await sql`
      SELECT id FROM authors WHERE slug = ${authorSlug} AND id != ${currentUser.author_id} LIMIT 1;
    `;
    if (slugConflict.length > 0) {
      throw new Error(`An author profile with slug "${authorSlug}" already exists.`);
    }
    await sql`
      UPDATE authors
      SET
        name = ${authorName},
        slug = ${authorSlug},
        role = ${authorRole},
        bio = ${input.author_bio?.trim() || null},
        avatar_url = ${input.author_avatar?.trim() || null},
        is_active = ${input.author_is_active !== false},
        updated_at = NOW()
      WHERE id = ${currentUser.author_id};
    `;
    finalAuthorId = currentUser.author_id;
  }

  // Update CMS user record
  await sql`
    UPDATE cms_users
    SET
      name = ${input.name?.trim() || null},
      role = ${input.role},
      author_id = ${finalAuthorId},
      is_active = ${input.is_active !== undefined ? input.is_active : currentUser.is_active},
      updated_at = NOW()
    WHERE id = ${input.id};
  `;

  const updated = await getCmsUserById(input.id);
  if (!updated) throw new Error("Failed to retrieve updated user.");
  return updated;
}

export async function updateCmsUserAuthor(id: string, authorId: string | null): Promise<CmsUser> {
  await checkInit();
  const rows = await sql`
    UPDATE cms_users
    SET author_id = ${authorId || null}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *;
  `;
  if (rows.length === 0) throw new Error("CMS user not found.");
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
