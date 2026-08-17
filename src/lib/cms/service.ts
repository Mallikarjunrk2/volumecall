import "server-only";
import { sql } from "@/lib/db";
import { ensureCmsTables } from "./db-init";
import {
  Article,
  ArticleCategory,
  ArticleInput,
  Author,
  AdminDashboardStats,
} from "./types";

async function checkInit() {
  await ensureCmsTables();
}

/**
 * Fetch all PUBLISHED articles for the public blog.
 * Strictly filters by status = 'PUBLISHED'.
 */
export async function getPublicArticles(): Promise<Article[]> {
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
        au.name as author_name, au.role as author_role, au.avatar_url as author_avatar
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
        au.name as author_name, au.role as author_role, au.avatar_url as author_avatar
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
    console.error("[getRelatedArticles Error]:", error);
    return [];
  }
}

/**
 * Fetch latest published articles for content discovery (excluding current article).
 */
export async function getLatestArticles(
  excludeId: string,
  limit: number = 5
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
      WHERE a.status = 'PUBLISHED' AND a.id != ${excludeId}
      ORDER BY a.published_at DESC, a.created_at DESC
      LIMIT ${limit};
    `;
    return rows as Article[];
  } catch (error) {
    console.error("[getLatestArticles Error]:", error);
    return [];
  }
}

/**
 * Fetch the previous and next published articles by publication date.
 */
export async function getPrevNextArticles(
  publishedAt: string | null,
  currentId: string
): Promise<{
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}> {
  await checkInit();
  try {
    const pubDate = publishedAt || new Date().toISOString();

    const [prevRows, nextRows] = await Promise.all([
      sql`
        SELECT title, slug FROM articles
        WHERE status = 'PUBLISHED' AND id != ${currentId} AND published_at <= ${pubDate}
        ORDER BY published_at DESC
        LIMIT 1;
      `,
      sql`
        SELECT title, slug FROM articles
        WHERE status = 'PUBLISHED' AND id != ${currentId} AND published_at >= ${pubDate}
        ORDER BY published_at ASC
        LIMIT 1;
      `,
    ]);

    return {
      prev: (prevRows[0] as { title: string; slug: string }) || null,
      next: (nextRows[0] as { title: string; slug: string }) || null,
    };
  } catch (error) {
    console.error("[getPrevNextArticles Error]:", error);
    return { prev: null, next: null };
  }
}

/**
 * Fetch all articles for Admin CMS with optional status filter.
 */
export async function getAdminArticles(statusFilter?: string): Promise<Article[]> {
  await checkInit();
  try {
    let rows;
    if (statusFilter && statusFilter !== "ALL") {
      rows = await sql`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.content_markdown, a.featured_image, a.featured_image_alt,
          a.category_id, a.author_id, a.created_by, a.status, a.published_at, a.scheduled_at,
          a.meta_title, a.meta_description, a.canonical_url, a.og_image,
          a.related_calculators, a.related_symbols, a.tags, a.sources_json,
          a.created_at, a.updated_at,
          c.name as category_name, c.slug as category_slug,
          au.name as author_name, au.role as author_role,
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
          a.id, a.title, a.slug, a.excerpt, a.content_markdown, a.featured_image, a.featured_image_alt,
          a.category_id, a.author_id, a.created_by, a.status, a.published_at, a.scheduled_at,
          a.meta_title, a.meta_description, a.canonical_url, a.og_image,
          a.related_calculators, a.related_symbols, a.tags, a.sources_json,
          a.created_at, a.updated_at,
          c.name as category_name, c.slug as category_slug,
          au.name as author_name, au.role as author_role,
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
        au.name as author_name, au.role as author_role,
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

/**
 * Get all available authors.
 */
export async function getAuthors(): Promise<Author[]> {
  await checkInit();
  try {
    const rows = await sql`SELECT * FROM authors ORDER BY name ASC;`;
    return rows as Author[];
  } catch {
    return [];
  }
}

/**
 * Get all available categories.
 */
export async function getCategories(): Promise<ArticleCategory[]> {
  await checkInit();
  try {
    const rows = await sql`SELECT * FROM article_categories ORDER BY sort_order ASC, name ASC;`;
    return rows as ArticleCategory[];
  } catch {
    return [];
  }
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
