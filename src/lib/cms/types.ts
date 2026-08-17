export type ArticleStatus = "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED";

export type CmsUserRole = "SUPER_ADMIN" | "EDITOR" | "AUTHOR" | "CONTRIBUTOR";

export interface CmsUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: CmsUserRole;
  author_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  author_name?: string | null;
  author_slug?: string | null;
  author_role?: string | null;
  author_bio?: string | null;
  author_avatar?: string | null;
  author_is_active?: boolean | null;
  author_article_count?: number;
}

export interface CmsUserInput {
  email: string;
  name?: string | null;
  role: CmsUserRole;
  author_id?: string | null;
  is_active?: boolean;
}

export interface UnifiedUserInput {
  id?: string;
  name?: string | null;
  email: string;
  role: CmsUserRole;
  is_active?: boolean;
  author_mode: "KEEP" | "NONE" | "LINK_EXISTING" | "CREATE_NEW" | "UPDATE_EXISTING";
  existing_author_id?: string | null;
  author_name?: string;
  author_slug?: string;
  author_role?: string;
  author_bio?: string | null;
  author_avatar?: string | null;
  author_is_active?: boolean;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  article_count?: number;
}

export interface AuthorInput {
  name: string;
  slug: string;
  role: string;
  bio?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  article_count?: number;
}

export interface ArticleCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface ArticleSource {
  title: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  category_id: string | null;
  author_id: string | null;
  created_by: string | null;
  status: ArticleStatus;
  published_at: string | null;
  scheduled_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  related_calculators?: string[] | null;
  related_symbols?: string[] | null;
  tags?: string[] | null;
  sources_json?: ArticleSource[] | null;
  created_at: string;
  updated_at: string;
  // Joined relation fields
  category_name?: string | null;
  category_slug?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  author_bio?: string | null;
  author_avatar?: string | null;
  created_by_name?: string | null;
  created_by_email?: string | null;
}

export interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  category_id?: string | null;
  author_id?: string | null;
  created_by?: string | null;
  status: ArticleStatus;
  published_at?: string | null;
  scheduled_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  og_image?: string | null;
  related_calculators?: string[] | null;
  related_symbols?: string[] | null;
  tags?: string[] | null;
  sources_json?: ArticleSource[] | null;
}

export interface AdminDashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  reviewArticles: number;
  scheduledArticles: number;
}

export interface MediaRecord {
  id: string;
  filename: string;
  original_filename: string;
  url: string;
  alt_text: string | null;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface MediaInput {
  filename: string;
  original_filename: string;
  url: string;
  alt_text?: string | null;
  mime_type: string;
  size_bytes: number;
  width?: number | null;
  height?: number | null;
  uploaded_by?: string | null;
}
