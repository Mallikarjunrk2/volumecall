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
 * - AUTHOR: Can edit their own articles (created_by === user.id).
 * - CONTRIBUTOR: Can edit their own draft articles (created_by === user.id and status === 'DRAFT').
 */
export function canEditArticle(
  user: CmsUser | null,
  article?: { created_by?: string | null; status?: string } | null
): boolean {
  if (!user || !user.is_active) return false;

  if (user.role === "SUPER_ADMIN" || user.role === "EDITOR") {
    return true;
  }

  if (!article) return false;

  const isOwner = !!article.created_by && article.created_by === user.id;

  if (user.role === "AUTHOR") {
    return isOwner;
  }

  if (user.role === "CONTRIBUTOR") {
    return isOwner && (article.status === "DRAFT" || !article.status);
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
 * - AUTHOR can delete their own unpublished drafts.
 */
export function canDeleteArticle(
  user: CmsUser | null,
  article?: { created_by?: string | null; status?: string } | null
): boolean {
  if (!user || !user.is_active) return false;

  if (user.role === "SUPER_ADMIN" || user.role === "EDITOR") {
    return true;
  }

  if (!article) return false;

  const isOwner = !!article.created_by && article.created_by === user.id;
  return isOwner && (article.status === "DRAFT" || !article.status);
}
