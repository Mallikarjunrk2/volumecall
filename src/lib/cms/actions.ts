"use server";

import { requireCmsUser } from "./auth";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  getAdminArticleById,
} from "./service";
import { ArticleInput } from "./types";
import {
  canCreateArticle,
  canEditArticle,
  canPublishArticle,
  canDeleteArticle,
} from "./permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
