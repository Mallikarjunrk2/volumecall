import "server-only";
import { sql } from "@/lib/db";
import { ensureCmsTables } from "./db-init";
import {
  Article,
  ArticleCategory,
  ArticleCategoryInput,
  ArticleInput,
  Author,
  AuthorInput,
  AdminDashboardStats,
} from "./types";

// In normal runtime, CMS tables exist permanently in PostgreSQL.
// checkInit is made a zero-overhead no-op so queries execute directly on first load.
async function checkInit(): Promise<void> {
  // No-op for maximum query performance
}

/**
 * Fetch all PUBLISHED articles for the public blog.
 * Strictly filters by status = 'PUBLISHED'.
 * Excludes heavy content_markdown for fast list transfer.
 */
export async function getPublicArticles(): Promise<Article[]> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.featured_image_alt,
        a.category_id, a.author_id, a.created_by, a.status, a.published_at, a.scheduled_at,
        a.meta_title, a.meta_description, a.canonical_url, a.og_image,
        a.related_calculators, a.related_symbols, a.tags, a.sources_json,
        a.created_at, a.updated_at,
        c.name as category_name, c.slug as category_slug,
        au.name as author_name, au.role as author_role, au.bio as author_bio, au.avatar_url as author_avatar
      FROM articles a
      LEFT JOIN article_categories c ON a.category_id = c.id
      LEFT JOIN authors au ON a.author_id = au.id
      WHERE a.status = 'PUBLISHED'
      ORDER BY a.published_at DESC, a.created_at DESC;
    `;
    return rows as Article[];
  } catch (error) {
    console.error("[getPublicArticles Error]:", error);
    return [];
  }
}

/**
 * Fetch a single PUBLISHED article by slug for public reading.
 * Returns null if the article does not exist or is not published.
 */
export async function getPublicArticleBySlug(slug: string): Promise<Article | null> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.content_markdown, a.featured_image, a.featured_image_alt,
        a.category_id, a.author_id, a.created_by, a.status, a.published_at, a.scheduled_at,
        a.meta_title, a.meta_description, a.canonical_url, a.og_image,
        a.related_calculators, a.related_symbols, a.tags, a.sources_json,
        a.created_at, a.updated_at,
        c.name as category_name, c.slug as category_slug,
        au.name as author_name, au.role as author_role, au.bio as author_bio, au.avatar_url as author_avatar
      FROM articles a
      LEFT JOIN article_categories c ON a.category_id = c.id
      LEFT JOIN authors au ON a.author_id = au.id
      WHERE a.slug = ${slug} AND a.status = 'PUBLISHED'
      LIMIT 1;
    `;
    return (rows[0] as Article) || null;
  } catch (error) {
    console.error(`[getPublicArticleBySlug Error] for slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch related articles for the public article page.
 * Prefers articles in the same category, falls back to recent published articles.
 */
export async function getRelatedArticles(
  currentId: string,
  categoryId?: string | null,
  limit: number = 3
): Promise<Article[]> {
  await checkInit();
  try {
    let rows;
    if (categoryId) {
      rows = await sql`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image, a.featured_image_alt,
          a.category_id, a.status, a.published_at, a.created_at,
          c.name as category_name, c.slug as category_slug,
          au.name as author_name
        FROM articles a
        LEFT JOIN article_categories c ON a.category_id = c.id
        LEFT JOIN authors au ON a.author_id = au.id
        WHERE a.status = 'PUBLISHED' AND a.id != ${currentId} AND a.category_id = ${categoryId}
        ORDER BY a.published_at DESC, a.created_at DESC
        LIMIT ${limit};
      `;
    }

    if (!rows || rows.length === 0) {
      rows = await sql`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image, a.featured_image_alt,
          a.category_id, a.status, a.published_at, a.created_at,
          c.name as category_name, c.slug as category_slug,
          au.name as author_name
        FROM articles a
        LEFT JOIN article_categories c ON a.category_id = c.id
        LEFT JOIN authors au ON a.author_id = au.id
        WHERE a.status = 'PUBLISHED' AND a.id != ${currentId}
        ORDER BY a.published_at DESC, a.created_at DESC
        LIMIT ${limit};
      `;
    }

    return rows as Article[];
  } catch (error) {
    console.error(`[getRelatedArticles Error] for id ${currentId}:`, error);
    return [];
  }
}

/**
 * Fetch adjacent articles (previous & next) for public navigation.
 */
export async function getAdjacentArticles(
  publishedAt: string | null,
  currentId?: string
): Promise<{
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}> {
  await checkInit();
  const effectiveDate = publishedAt || new Date().toISOString();
  try {
    const prevRows = currentId
      ? await sql`
          SELECT title, slug
          FROM articles
          WHERE status = 'PUBLISHED' AND id != ${currentId} AND published_at < ${effectiveDate}
          ORDER BY published_at DESC
          LIMIT 1;
        `
      : await sql`
          SELECT title, slug
          FROM articles
          WHERE status = 'PUBLISHED' AND published_at < ${effectiveDate}
          ORDER BY published_at DESC
          LIMIT 1;
        `;

    const nextRows = currentId
      ? await sql`
          SELECT title, slug
          FROM articles
          WHERE status = 'PUBLISHED' AND id != ${currentId} AND published_at > ${effectiveDate}
          ORDER BY published_at ASC
          LIMIT 1;
        `
      : await sql`
          SELECT title, slug
          FROM articles
          WHERE status = 'PUBLISHED' AND published_at > ${effectiveDate}
          ORDER BY published_at ASC
          LIMIT 1;
        `;

    return {
      prev: (prevRows[0] as { title: string; slug: string }) || null,
      next: (nextRows[0] as { title: string; slug: string }) || null,
    };
  } catch (error) {
    console.error("[getAdjacentArticles Error]:", error);
    return { prev: null, next: null };
  }
}

export const getPrevNextArticles = getAdjacentArticles;

/**
 * Fetch articles related to a stock symbol for the stock detail page.
 */
export async function getArticlesForSymbol(
  symbol: string,
  limit: number = 3
): Promise<Article[]> {
  await checkInit();
  const upper = symbol.toUpperCase().trim();
  try {
    const rows = await sql`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.featured_image_alt,
        a.category_id, a.status, a.published_at, a.created_at,
        c.name as category_name, c.slug as category_slug,
        au.name as author_name
      FROM articles a
      LEFT JOIN article_categories c ON a.category_id = c.id
      LEFT JOIN authors au ON a.author_id = au.id
      WHERE a.status = 'PUBLISHED' AND ${upper} = ANY(a.related_symbols)
      ORDER BY a.published_at DESC, a.created_at DESC
      LIMIT ${limit};
    `;
    return rows as Article[];
  } catch (error) {
    console.error(`[getArticlesForSymbol Error] for symbol ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch articles related to a calculator for calculator pages.
 */
export async function getArticlesForCalculator(
  calculatorSlug: string,
  limit: number = 3
): Promise<Article[]> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.featured_image_alt,
        a.category_id, a.status, a.published_at, a.created_at,
        c.name as category_name, c.slug as category_slug,
        au.name as author_name
      FROM articles a
      LEFT JOIN article_categories c ON a.category_id = c.id
      LEFT JOIN authors au ON a.author_id = au.id
      WHERE a.status = 'PUBLISHED' AND ${calculatorSlug} = ANY(a.related_calculators)
      ORDER BY a.published_at DESC, a.created_at DESC
      LIMIT ${limit};
    `;
    return rows as Article[];
  } catch (error) {
    console.error(`[getArticlesForCalculator Error] for calculator ${calculatorSlug}:`, error);
    return [];
  }
}

/**
 * Fetch all articles for Admin management (includes DRAFT, REVIEW, SCHEDULED, PUBLISHED).
 * Excludes heavy content_markdown and full metadata for high-performance list rendering.
 */
export async function getAdminArticles(statusFilter?: string): Promise<Article[]> {
  await checkInit();
  try {
    let rows;
    if (statusFilter && statusFilter !== "ALL") {
      rows = await sql`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image, a.featured_image_alt,
          a.category_id, a.author_id, a.created_by, a.status, a.published_at, a.scheduled_at,
          a.created_at, a.updated_at,
          c.name as category_name, c.slug as category_slug,
          au.name as author_name, au.role as author_role, au.bio as author_bio, au.avatar_url as author_avatar,
          cu.name as created_by_name, cu.email as created_by_email
        FROM articles a
        LEFT JOIN article_categories c ON a.category_id = c.id
        LEFT JOIN authors au ON a.author_id = au.id
        LEFT JOIN cms_users cu ON a.created_by = cu.id
        WHERE a.status = ${statusFilter}
        ORDER BY a.updated_at DESC;
      `;
    } else {
      rows = await sql`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image, a.featured_image_alt,
          a.category_id, a.author_id, a.created_by, a.status, a.published_at, a.scheduled_at,
          a.created_at, a.updated_at,
          c.name as category_name, c.slug as category_slug,
          au.name as author_name, au.role as author_role, au.bio as author_bio, au.avatar_url as author_avatar,
          cu.name as created_by_name, cu.email as created_by_email
        FROM articles a
        LEFT JOIN article_categories c ON a.category_id = c.id
        LEFT JOIN authors au ON a.author_id = au.id
        LEFT JOIN cms_users cu ON a.created_by = cu.id
        ORDER BY a.updated_at DESC;
      `;
    }
    return rows as Article[];
  } catch (error) {
    console.error("[getAdminArticles Error]:", error);
    return [];
  }
}

/**
 * Fetch top recent articles for the Dashboard overview with minimal fields and direct SQL limit.
 */
export async function getRecentAdminArticles(limit: number = 5): Promise<Article[]> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        a.id, a.title, a.slug, a.status, a.published_at, a.updated_at, a.created_at,
        c.name as category_name, c.slug as category_slug
      FROM articles a
      LEFT JOIN article_categories c ON a.category_id = c.id
      ORDER BY a.updated_at DESC
      LIMIT ${limit};
    `;
    return rows as Article[];
  } catch (error) {
    console.error("[getRecentAdminArticles Error]:", error);
    return [];
  }
}

/**
 * Fetch any single article by ID for editing.
 */
export async function getAdminArticleById(id: string): Promise<Article | null> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.content_markdown, a.featured_image, a.featured_image_alt,
        a.category_id, a.author_id, a.created_by, a.status, a.published_at, a.scheduled_at,
        a.meta_title, a.meta_description, a.canonical_url, a.og_image,
        a.related_calculators, a.related_symbols, a.tags, a.sources_json,
        a.created_at, a.updated_at,
        c.name as category_name, c.slug as category_slug,
        au.name as author_name, au.role as author_role, au.bio as author_bio, au.avatar_url as author_avatar,
        cu.name as created_by_name, cu.email as created_by_email
      FROM articles a
      LEFT JOIN article_categories c ON a.category_id = c.id
      LEFT JOIN authors au ON a.author_id = au.id
      LEFT JOIN cms_users cu ON a.created_by = cu.id
      WHERE a.id = ${id}
      LIMIT 1;
    `;
    return (rows[0] as Article) || null;
  } catch (error) {
    console.error(`[getAdminArticleById Error] for id ${id}:`, error);
    return null;
  }
}

/**
 * Create a new article.
 */
export async function createArticle(input: ArticleInput): Promise<Article> {
  await checkInit();
  const publishedAt = input.status === "PUBLISHED" ? (input.published_at || new Date().toISOString()) : (input.published_at || null);
  const sourcesJson = JSON.stringify(input.sources_json || []);

  const rows = await sql`
    INSERT INTO articles (
      title, slug, excerpt, content_markdown, featured_image, featured_image_alt,
      category_id, author_id, created_by, status, published_at, scheduled_at,
      meta_title, meta_description, canonical_url, og_image,
      related_calculators, related_symbols, tags, sources_json, updated_at
    ) VALUES (
      ${input.title}, ${input.slug}, ${input.excerpt}, ${input.content_markdown},
      ${input.featured_image || null}, ${input.featured_image_alt || null},
      ${input.category_id || null}, ${input.author_id || null}, ${input.created_by || null},
      ${input.status}, ${publishedAt}, ${input.scheduled_at || null},
      ${input.meta_title || null}, ${input.meta_description || null},
      ${input.canonical_url || null}, ${input.og_image || null},
      ${input.related_calculators || []}, ${input.related_symbols || []},
      ${input.tags || []}, ${sourcesJson}::jsonb, NOW()
    )
    RETURNING *;
  `;
  return rows[0] as Article;
}

/**
 * Update an existing article.
 */
export async function updateArticle(id: string, input: ArticleInput): Promise<Article> {
  await checkInit();
  const publishedAt = input.status === "PUBLISHED" ? (input.published_at || new Date().toISOString()) : (input.published_at || null);
  const sourcesJson = JSON.stringify(input.sources_json || []);

  const rows = await sql`
    UPDATE articles SET
      title = ${input.title},
      slug = ${input.slug},
      excerpt = ${input.excerpt},
      content_markdown = ${input.content_markdown},
      featured_image = ${input.featured_image || null},
      featured_image_alt = ${input.featured_image_alt || null},
      category_id = ${input.category_id || null},
      author_id = ${input.author_id || null},
      status = ${input.status},
      published_at = ${publishedAt},
      scheduled_at = ${input.scheduled_at || null},
      meta_title = ${input.meta_title || null},
      meta_description = ${input.meta_description || null},
      canonical_url = ${input.canonical_url || null},
      og_image = ${input.og_image || null},
      related_calculators = ${input.related_calculators || []},
      related_symbols = ${input.related_symbols || []},
      tags = ${input.tags || []},
      sources_json = ${sourcesJson}::jsonb,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *;
  `;
  return rows[0] as Article;
}

/**
 * Delete an article.
 */
export async function deleteArticle(id: string): Promise<void> {
  await checkInit();
  await sql`DELETE FROM articles WHERE id = ${id};`;
}

/**
 * Publish an article directly.
 */
export async function publishArticle(id: string): Promise<void> {
  await checkInit();
  await sql`
    UPDATE articles SET
      status = 'PUBLISHED',
      published_at = COALESCE(published_at, NOW()),
      updated_at = NOW()
    WHERE id = ${id};
  `;
}

// ════════════════════════════════════════════════════════════════════════════
// ─── CATEGORY MANAGEMENT SERVICE FUNCTIONS ─────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get all available categories.
 * If includeInactive = true, returns all categories with article counts.
 * If includeInactive = false, returns only active categories.
 */
export async function getCategories(includeInactive: boolean = false): Promise<ArticleCategory[]> {
  await checkInit();
  try {
    if (includeInactive) {
      const rows = await sql`
        SELECT 
          c.id, c.name, c.slug, c.description, c.sort_order, 
          COALESCE(c.is_active, true) as is_active,
          c.created_at, c.updated_at,
          COUNT(a.id)::int as article_count
        FROM article_categories c
        LEFT JOIN articles a ON a.category_id = c.id
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC;
      `;
      return rows as ArticleCategory[];
    } else {
      const rows = await sql`
        SELECT 
          id, name, slug, description, sort_order, 
          COALESCE(is_active, true) as is_active,
          created_at, updated_at
        FROM article_categories 
        WHERE COALESCE(is_active, true) = true
        ORDER BY sort_order ASC, name ASC;
      `;
      return rows as ArticleCategory[];
    }
  } catch (error) {
    console.error("[getCategories Error]:", error);
    return [];
  }
}

/**
 * Get a single category by ID.
 */
export async function getCategoryById(id: string): Promise<ArticleCategory | null> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        c.id, c.name, c.slug, c.description, c.sort_order, 
        COALESCE(c.is_active, true) as is_active,
        c.created_at, c.updated_at,
        COUNT(a.id)::int as article_count
      FROM article_categories c
      LEFT JOIN articles a ON a.category_id = c.id
      WHERE c.id = ${id}
      GROUP BY c.id
      LIMIT 1;
    `;
    return (rows[0] as ArticleCategory) || null;
  } catch (error) {
    console.error(`[getCategoryById Error] for id ${id}:`, error);
    return null;
  }
}

/**
 * Get a single category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<ArticleCategory | null> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        id, name, slug, description, sort_order, 
        COALESCE(is_active, true) as is_active,
        created_at, updated_at
      FROM article_categories
      WHERE slug = ${slug}
      LIMIT 1;
    `;
    return (rows[0] as ArticleCategory) || null;
  } catch (error) {
    console.error(`[getCategoryBySlug Error] for slug ${slug}:`, error);
    return null;
  }
}

/**
 * Create a new category.
 */
export async function createCategory(input: ArticleCategoryInput): Promise<ArticleCategory> {
  await checkInit();
  const isActive = input.is_active !== undefined ? input.is_active : true;
  const sortOrder = input.sort_order ?? 0;

  const rows = await sql`
    INSERT INTO article_categories (
      name, slug, description, sort_order, is_active, created_at, updated_at
    ) VALUES (
      ${input.name.trim()},
      ${input.slug.trim()},
      ${input.description?.trim() || null},
      ${sortOrder},
      ${isActive},
      NOW(),
      NOW()
    )
    RETURNING id, name, slug, description, sort_order, is_active, created_at, updated_at;
  `;
  return rows[0] as ArticleCategory;
}

/**
 * Update an existing category.
 */
export async function updateCategory(id: string, input: ArticleCategoryInput): Promise<ArticleCategory> {
  await checkInit();
  const isActive = input.is_active !== undefined ? input.is_active : true;
  const sortOrder = input.sort_order ?? 0;

  const rows = await sql`
    UPDATE article_categories SET
      name = ${input.name.trim()},
      slug = ${input.slug.trim()},
      description = ${input.description?.trim() || null},
      sort_order = ${sortOrder},
      is_active = ${isActive},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, slug, description, sort_order, is_active, created_at, updated_at;
  `;
  return rows[0] as ArticleCategory;
}

/**
 * Safe delete category: Reassigns associated articles if a new category ID is provided,
 * or safely sets category_id to NULL.
 */
export async function deleteCategory(id: string, reassignCategoryId?: string | null): Promise<void> {
  await checkInit();
  if (reassignCategoryId && reassignCategoryId !== id) {
    await sql`UPDATE articles SET category_id = ${reassignCategoryId} WHERE category_id = ${id};`;
  } else {
    await sql`UPDATE articles SET category_id = NULL WHERE category_id = ${id};`;
  }
  await sql`DELETE FROM article_categories WHERE id = ${id};`;
}

/**
 * Toggle category active status.
 */
export async function toggleCategoryActive(id: string, isActive: boolean): Promise<ArticleCategory> {
  await checkInit();
  const rows = await sql`
    UPDATE article_categories SET
      is_active = ${isActive},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, slug, description, sort_order, is_active, created_at, updated_at;
  `;
  return rows[0] as ArticleCategory;
}

// ════════════════════════════════════════════════════════════════════════════
// ─── AUTHOR MANAGEMENT SERVICE FUNCTIONS ───────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get all available authors.
 * If includeInactive = true, returns all authors with article counts.
 * If includeInactive = false, returns only active authors.
 */
export async function getAuthors(includeInactive: boolean = false): Promise<Author[]> {
  await checkInit();
  try {
    if (includeInactive) {
      const rows = await sql`
        SELECT 
          au.id, au.name, au.slug, au.role, au.bio, au.avatar_url,
          COALESCE(au.is_active, true) as is_active,
          au.created_at, au.updated_at,
          COUNT(a.id)::int as article_count
        FROM authors au
        LEFT JOIN articles a ON a.author_id = au.id
        GROUP BY au.id
        ORDER BY au.name ASC;
      `;
      return rows as Author[];
    } else {
      const rows = await sql`
        SELECT 
          id, name, slug, role, bio, avatar_url,
          COALESCE(is_active, true) as is_active,
          created_at, updated_at
        FROM authors
        WHERE COALESCE(is_active, true) = true
        ORDER BY name ASC;
      `;
      return rows as Author[];
    }
  } catch (error) {
    console.error("[getAuthors Error]:", error);
    return [];
  }
}

/**
 * Get a single author by ID.
 */
export async function getAuthorById(id: string): Promise<Author | null> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        au.id, au.name, au.slug, au.role, au.bio, au.avatar_url,
        COALESCE(au.is_active, true) as is_active,
        au.created_at, au.updated_at,
        COUNT(a.id)::int as article_count
      FROM authors au
      LEFT JOIN articles a ON a.author_id = au.id
      WHERE au.id = ${id}
      GROUP BY au.id
      LIMIT 1;
    `;
    return (rows[0] as Author) || null;
  } catch (error) {
    console.error(`[getAuthorById Error] for id ${id}:`, error);
    return null;
  }
}

/**
 * Get a single author by slug.
 */
export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT 
        id, name, slug, role, bio, avatar_url,
        COALESCE(is_active, true) as is_active,
        created_at, updated_at
      FROM authors
      WHERE slug = ${slug}
      LIMIT 1;
    `;
    return (rows[0] as Author) || null;
  } catch (error) {
    console.error(`[getAuthorBySlug Error] for slug ${slug}:`, error);
    return null;
  }
}

/**
 * Create a new author.
 */
export async function createAuthor(input: AuthorInput): Promise<Author> {
  await checkInit();
  const isActive = input.is_active !== undefined ? input.is_active : true;

  const rows = await sql`
    INSERT INTO authors (
      name, slug, role, bio, avatar_url, is_active, created_at, updated_at
    ) VALUES (
      ${input.name.trim()},
      ${input.slug.trim()},
      ${input.role.trim()},
      ${input.bio?.trim() || null},
      ${input.avatar_url?.trim() || null},
      ${isActive},
      NOW(),
      NOW()
    )
    RETURNING id, name, slug, role, bio, avatar_url, is_active, created_at, updated_at;
  `;
  return rows[0] as Author;
}

/**
 * Update an existing author.
 */
export async function updateAuthor(id: string, input: AuthorInput): Promise<Author> {
  await checkInit();
  const isActive = input.is_active !== undefined ? input.is_active : true;

  const rows = await sql`
    UPDATE authors SET
      name = ${input.name.trim()},
      slug = ${input.slug.trim()},
      role = ${input.role.trim()},
      bio = ${input.bio?.trim() || null},
      avatar_url = ${input.avatar_url?.trim() || null},
      is_active = ${isActive},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, slug, role, bio, avatar_url, is_active, created_at, updated_at;
  `;
  return rows[0] as Author;
}

/**
 * Safe delete author: Reassigns associated articles if a new author ID is provided,
 * or safely sets author_id to NULL.
 */
export async function deleteAuthor(id: string, reassignAuthorId?: string | null): Promise<void> {
  await checkInit();
  if (reassignAuthorId && reassignAuthorId !== id) {
    await sql`UPDATE articles SET author_id = ${reassignAuthorId} WHERE author_id = ${id};`;
  } else {
    await sql`UPDATE articles SET author_id = NULL WHERE author_id = ${id};`;
  }
  await sql`DELETE FROM authors WHERE id = ${id};`;
}

/**
 * Toggle author active status.
 */
export async function toggleAuthorActive(id: string, isActive: boolean): Promise<Author> {
  await checkInit();
  const rows = await sql`
    UPDATE authors SET
      is_active = ${isActive},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, slug, role, bio, avatar_url, is_active, created_at, updated_at;
  `;
  return rows[0] as Author;
}

/**
 * Get Admin dashboard summary metrics.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END)::int as published,
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END)::int as drafts,
        COUNT(CASE WHEN status = 'REVIEW' THEN 1 END)::int as reviews,
        COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END)::int as scheduled
      FROM articles;
    `;
    const r = rows[0];
    return {
      totalArticles: r?.total || 0,
      publishedArticles: r?.published || 0,
      draftArticles: r?.drafts || 0,
      reviewArticles: r?.reviews || 0,
      scheduledArticles: r?.scheduled || 0,
    };
  } catch {
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      reviewArticles: 0,
      scheduledArticles: 0,
    };
  }
}
