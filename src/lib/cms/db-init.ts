import "server-only";
import { sql } from "@/lib/db";

const CMS_ADVISORY_LOCK_ID = 839174028;

let initPromise: Promise<void> | null = null;

async function runInitialization(): Promise<void> {
  try {
    // 1. Acquire transaction/session advisory lock in PostgreSQL to serialize across serverless instances
    await sql`SELECT pg_advisory_lock(${CMS_ADVISORY_LOCK_ID});`;

    try {
      // 2. CMS Users Table (RBAC)
      await sql`
        CREATE TABLE IF NOT EXISTS cms_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          image TEXT,
          role VARCHAR(30) NOT NULL DEFAULT 'AUTHOR',
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
        );
      `;

      // 3. Authors Table (Public article profile bios)
      await sql`
        CREATE TABLE IF NOT EXISTS authors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          role VARCHAR(100) DEFAULT 'Financial Analyst',
          bio TEXT,
          avatar_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // 4. Categories Table
      await sql`
        CREATE TABLE IF NOT EXISTS article_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // 5. Articles Table
      await sql`
        CREATE TABLE IF NOT EXISTS articles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          excerpt TEXT NOT NULL,
          content_markdown TEXT NOT NULL,
          featured_image TEXT,
          featured_image_alt VARCHAR(255),
          category_id UUID REFERENCES article_categories(id) ON DELETE SET NULL,
          author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
          published_at TIMESTAMPTZ,
          scheduled_at TIMESTAMPTZ,
          meta_title VARCHAR(255),
          meta_description TEXT,
          canonical_url TEXT,
          og_image TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // Add created_by, related fields, tags, and sources columns to articles
      await sql`
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES cms_users(id) ON DELETE SET NULL;
      `;
      await sql`
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_calculators TEXT[] DEFAULT '{}';
      `;
      await sql`
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_symbols TEXT[] DEFAULT '{}';
      `;
      await sql`
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
      `;
      await sql`
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS sources_json JSONB DEFAULT '[]'::jsonb;
      `;
      await sql`
        ALTER TABLE article_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
      `;
      await sql`
        ALTER TABLE article_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      `;
      await sql`
        ALTER TABLE authors ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
      `;
      await sql`
        ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES authors(id) ON DELETE SET NULL;
      `;

      // 6. Media Table (Phase 2A)
      await sql`
        CREATE TABLE IF NOT EXISTS media (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filename VARCHAR(255) NOT NULL,
          original_filename VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          alt_text VARCHAR(255),
          mime_type VARCHAR(100) NOT NULL,
          size_bytes INT NOT NULL,
          width INT,
          height INT,
          uploaded_by VARCHAR(150),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // 7. Indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_cms_users_email ON cms_users(email);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_cms_users_role ON cms_users(role);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_cms_users_is_active ON cms_users(is_active);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_cms_users_author_id ON cms_users(author_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_articles_created_by ON articles(created_by);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);`;

      // 8. Seed default author if not existing
      await sql`
        INSERT INTO authors (name, slug, role, bio)
        VALUES (
          'VolumeCall Research',
          'volumecall-research',
          'Equity Research & Quantitative Analysis',
          'Institutional equity research, valuation frameworks, and fundamental market analysis for Indian equities.'
        )
        ON CONFLICT (slug) DO NOTHING;
      `;

      // 9. Seed initial categories if not existing
      const defaultCategories = [
        { name: "Fundamental Analysis", slug: "fundamental-analysis", desc: "Balance sheets, cash flows, ROE/ROCE, and financial statements analysis." },
        { name: "Valuation & Models", slug: "valuation-models", desc: "DCF modeling, P/E multiples, EV/EBITDA, and fair value estimation." },
        { name: "Markets & Economy", slug: "markets-economy", desc: "Indian market trends, sector rotation, RBI policies, and macroeconomic insights." },
        { name: "Investing Guides", slug: "investing-guides", desc: "Step-by-step guides on SIPs, compounding, portfolio construction, and risk management." },
      ];

      for (let i = 0; i < defaultCategories.length; i++) {
        const cat = defaultCategories[i];
        await sql`
          INSERT INTO article_categories (name, slug, description, sort_order)
          VALUES (${cat.name}, ${cat.slug}, ${cat.desc}, ${i + 1})
          ON CONFLICT (slug) DO NOTHING;
        `;
      }
    } finally {
      // 10. Always unlock the advisory lock
      await sql`SELECT pg_advisory_unlock(${CMS_ADVISORY_LOCK_ID});`.catch((unlockErr) => {
        console.error("[CMS DB Unlock Error]:", unlockErr);
      });
    }
  } catch (error) {
    console.error("[CMS Database Init Error]:", error);
    throw error;
  }
}

let isInitialized = false;

/**
 * Idempotently and safely initializes CMS database tables.
 * Safe for concurrent requests across serverless instances and within the same process.
 */
export async function ensureCmsTables(): Promise<void> {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = runInitialization()
      .then(() => {
        isInitialized = true;
      })
      .catch((err) => {
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
}
