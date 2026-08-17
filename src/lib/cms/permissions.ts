import { CmsUser, CmsUserRole } from "./types";

export const ROLE_HIERARCHY: Record<CmsUserRole, number> = {
  SUPER_ADMIN: 4,
  EDITOR: 3,
  AUTHOR: 2,
  CONTRIBUTOR: 1,
};

export const ALLOWED_ROLES: CmsUserRole[] = [
  "SUPER_ADMIN",
  "EDITOR",
  "AUTHOR",
  "CONTRIBUTOR",
];

export function isValidRole(role: string): role is CmsUserRole {
  return ALLOWED_ROLES.includes(role as CmsUserRole);
}

/**
 * Super Admin only: User management.
 */
export function canManageUsers(user: CmsUser | null): boolean {
  return user?.role === "SUPER_ADMIN" && user.is_active;
}

/**
 * Category Permissions:
 * - canViewCategories: All active CMS users (SUPER_ADMIN, EDITOR, AUTHOR, CONTRIBUTOR)
 * - canCreateCategory: All active CMS users (SUPER_ADMIN, EDITOR, AUTHOR, CONTRIBUTOR)
 * - canEditCategory: SUPER_ADMIN and EDITOR
 * - canDeleteCategory: SUPER_ADMIN only
 */
export function canViewCategories(user: CmsUser | null): boolean {
  return !!user && user.is_active;
}

export function canCreateCategory(user: CmsUser | null): boolean {
  return !!user && user.is_active;
}

export function canEditCategory(user: CmsUser | null): boolean {
  if (!user || !user.is_active) return false;
  return user.role === "SUPER_ADMIN" || user.role === "EDITOR";
}

export function canDeleteCategory(user: CmsUser | null): boolean {
  return user?.role === "SUPER_ADMIN" && user.is_active;
}

/**
 * Super Admin only: Full category administration (legacy helper).
 */
export function canManageCategories(user: CmsUser | null): boolean {
  return user?.role === "SUPER_ADMIN" && user.is_active;
}

/**
 * Super Admin only: Author profile management.
 */
export function canManageAuthors(user: CmsUser | null): boolean {
  return user?.role === "SUPER_ADMIN" && user.is_active;
}

/**
 * Super Admin only: Can select or change the assigned author profile on articles.
 */
export function canSelectAuthor(user: CmsUser | null): boolean {
  return user?.role === "SUPER_ADMIN" && user.is_active;
}

/**
 * All active CMS roles can upload media for article body content.
 */
export function canManageMedia(user: CmsUser | null): boolean {
  return !!user && user.is_active;
}

/**
 * All active CMS roles can draft/create articles.
 */
export function canCreateArticle(user: CmsUser | null): boolean {
  return !!user && user.is_active;
}

/**
 * Article Editing Rules:
 * - SUPER_ADMIN: Can edit any article.
 * - EDITOR: Can edit any article.
 * - CONTRIBUTOR / AUTHOR: Can edit ONLY articles belonging to their own user ID or linked author profile.
 */
export function canEditArticle(
  user: CmsUser | null,
  article?: { created_by?: string | null; author_id?: string | null; status?: string } | null
): boolean {
  if (!user || !user.is_active) return false;

  if (user.role === "SUPER_ADMIN" || user.role === "EDITOR") {
    return true;
  }

  if (!article) return false;

  const isOwner =
    (!!article.created_by && article.created_by === user.id) ||
    (!!user.author_id && !!article.author_id && article.author_id === user.author_id);

  if (user.role === "CONTRIBUTOR" || user.role === "AUTHOR") {
    return isOwner;
  }

  return false;
}

/**
 * Publishing Rules:
 * - Only SUPER_ADMIN and EDITOR can set article status to 'PUBLISHED' or 'SCHEDULED'.
 * - AUTHOR and CONTRIBUTOR cannot publish.
 */
export function canPublishArticle(user: CmsUser | null): boolean {
  if (!user || !user.is_active) return false;
  return user.role === "SUPER_ADMIN" || user.role === "EDITOR";
}

/**
 * Deletion Rules:
 * - SUPER_ADMIN & EDITOR can delete any article.
 * - CONTRIBUTOR & AUTHOR can delete ONLY their own unpublished drafts.
 */
export function canDeleteArticle(
  user: CmsUser | null,
  article?: { created_by?: string | null; author_id?: string | null; status?: string } | null
): boolean {
  if (!user || !user.is_active) return false;

  if (user.role === "SUPER_ADMIN" || user.role === "EDITOR") {
    return true;
  }

  if (!article) return false;

  const isOwner =
    (!!article.created_by && article.created_by === user.id) ||
    (!!user.author_id && !!article.author_id && article.author_id === user.author_id);

  return isOwner && (article.status === "DRAFT" || !article.status);
}
