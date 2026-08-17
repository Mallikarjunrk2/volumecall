"use server";

import { requireCmsUser } from "./auth";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  getAdminArticleById,
} from "./service";
import { Article, ArticleInput } from "./types";
import {
  canCreateArticle,
  canEditArticle,
  canPublishArticle,
  canDeleteArticle,
} from "./permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface SaveDraftResult {
  success: boolean;
  article?: Article;
  error?: string;
}

/**
 * Server Action: Auto-saves or manually saves an article as a DRAFT.
 * Does NOT redirect, returning the saved article ID so the client can update its reference.
 */
export async function saveArticleDraftAction(
  input: ArticleInput,
  id?: string
): Promise<SaveDraftResult> {
  try {
    const user = await requireCmsUser();

    // Generate safe draft slug if not provided
    const slug = input.slug?.trim() || `draft-${Date.now()}`;
    const draftInput: ArticleInput = {
      ...input,
      slug,
      status: "DRAFT",
    };

    let article: Article;

    if (id) {
      const existing = await getAdminArticleById(id);
      if (!existing) {
        return { success: false, error: "Draft article not found." };
      }
      if (!canEditArticle(user, existing)) {
        return { success: false, error: "Permission denied to edit this draft." };
      }
      article = await updateArticle(id, draftInput);
    } else {
      if (!canCreateArticle(user)) {
        return { success: false, error: "Permission denied to create drafts." };
      }
      article = await createArticle({
        ...draftInput,
        created_by: user.id,
      });
    }

    revalidatePath("/admin/articles");
    return { success: true, article };
  } catch (error) {
    console.error("[Save Draft Error]:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save draft.",
    };
  }
}

/**
 * Server Action: Persists and publishes an article.
 */
export async function saveAndPublishArticleAction(
  input: ArticleInput,
  id?: string
): Promise<SaveDraftResult> {
  try {
    const user = await requireCmsUser();

    if (!canPublishArticle(user)) {
      return { success: false, error: "You do not have permission to publish articles." };
    }

    const publishInput: ArticleInput = {
      ...input,
      status: "PUBLISHED",
      published_at: input.published_at || new Date().toISOString(),
    };

    let article: Article;

    if (id) {
      const existing = await getAdminArticleById(id);
      if (!existing) {
        return { success: false, error: "Article not found." };
      }
      if (!canEditArticle(user, existing)) {
        return { success: false, error: "Permission denied to edit this article." };
      }
      article = await updateArticle(id, publishInput);
    } else {
      if (!canCreateArticle(user)) {
        return { success: false, error: "Permission denied to create articles." };
      }
      article = await createArticle({
        ...publishInput,
        created_by: user.id,
      });
    }

    revalidatePath("/admin/articles");
    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);

    return { success: true, article };
  } catch (error) {
    console.error("[Publish Article Error]:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish article.",
    };
  }
}

export async function createArticleAction(input: ArticleInput) {
  const user = await requireCmsUser();

  if (!canCreateArticle(user)) {
    throw new Error("You do not have permission to create articles.");
  }

  // Non-publishers (Author, Contributor) can only create Drafts
  let status = input.status;
  if (status === "PUBLISHED" && !canPublishArticle(user)) {
    status = "DRAFT";
  }

  const effectiveInput: ArticleInput = {
    ...input,
    status,
    created_by: user.id,
  };

  const article = await createArticle(effectiveInput);
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  revalidatePath(`/blog/${article.slug}`);

  redirect("/admin/articles");
}

export async function updateArticleAction(id: string, input: ArticleInput) {
  const user = await requireCmsUser();
  const existing = await getAdminArticleById(id);

  if (!existing) {
    throw new Error("Article not found.");
  }

  if (!canEditArticle(user, existing)) {
    throw new Error("You do not have permission to edit this article.");
  }

  // Non-publishers (Author, Contributor) cannot publish directly
  let status = input.status;
  if (status === "PUBLISHED" && !canPublishArticle(user)) {
    status = existing.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  }

  const effectiveInput: ArticleInput = {
    ...input,
    status,
  };

  const article = await updateArticle(id, effectiveInput);
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  revalidatePath(`/blog/${article.slug}`);

  redirect("/admin/articles");
}

export async function deleteArticleAction(id: string) {
  const user = await requireCmsUser();
  const existing = await getAdminArticleById(id);

  if (!existing) {
    throw new Error("Article not found.");
  }

  if (!canDeleteArticle(user, existing)) {
    throw new Error("You do not have permission to delete this article.");
  }

  await deleteArticle(id);
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
}

export async function publishArticleAction(id: string) {
  const user = await requireCmsUser();

  if (!canPublishArticle(user)) {
    throw new Error("You do not have permission to publish articles.");
  }

  await publishArticle(id);
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
}
