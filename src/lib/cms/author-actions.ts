"use server";

import { requireCmsUser } from "./auth";
import { canManageAuthors } from "./permissions";
import {
  createAuthor,
  updateAuthor,
  deleteAuthor,
  toggleAuthorActive,
  getAuthorBySlug,
  getAuthorById,
} from "./service";
import { Author, AuthorInput } from "./types";
import { revalidatePath } from "next/cache";

export interface AuthorActionResult {
  success: boolean;
  author?: Author;
  error?: string;
}

/**
 * Server Action: Create a new author profile
 */
export async function createAuthorAction(input: AuthorInput): Promise<AuthorActionResult> {
  try {
    const user = await requireCmsUser();
    if (!canManageAuthors(user)) {
      return { success: false, error: "Permission denied. Only Super Administrators can manage author profiles." };
    }

    const name = input.name?.trim();
    const slug = input.slug?.trim();
    const role = input.role?.trim();

    if (!name || !slug || !role) {
      return { success: false, error: "Author name, slug, and role/title are required." };
    }

    const existingSlug = await getAuthorBySlug(slug);
    if (existingSlug) {
      return { success: false, error: `An author with the slug "${slug}" already exists.` };
    }

    const author = await createAuthor({
      name,
      slug,
      role,
      bio: input.bio?.trim() || null,
      avatar_url: input.avatar_url?.trim() || null,
      is_active: input.is_active !== false,
    });

    revalidatePath("/admin/authors");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true, author };
  } catch (error) {
    console.error("[createAuthorAction Error]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create author profile." };
  }
}

/**
 * Server Action: Update an existing author profile
 */
export async function updateAuthorAction(
  id: string,
  input: AuthorInput
): Promise<AuthorActionResult> {
  try {
    const user = await requireCmsUser();
    if (!canManageAuthors(user)) {
      return { success: false, error: "Permission denied. Only Super Administrators can manage author profiles." };
    }

    const name = input.name?.trim();
    const slug = input.slug?.trim();
    const role = input.role?.trim();

    if (!name || !slug || !role) {
      return { success: false, error: "Author name, slug, and role/title are required." };
    }

    const existing = await getAuthorById(id);
    if (!existing) {
      return { success: false, error: "Author not found." };
    }

    if (slug !== existing.slug) {
      const duplicateSlug = await getAuthorBySlug(slug);
      if (duplicateSlug) {
        return { success: false, error: `An author with the slug "${slug}" already exists.` };
      }
    }

    const author = await updateAuthor(id, {
      name,
      slug,
      role,
      bio: input.bio?.trim() || null,
      avatar_url: input.avatar_url?.trim() || null,
      is_active: input.is_active !== undefined ? input.is_active : existing.is_active,
    });

    revalidatePath("/admin/authors");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true, author };
  } catch (error) {
    console.error("[updateAuthorAction Error]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update author profile." };
  }
}

/**
 * Server Action: Delete author safely with optional article reassignment
 */
export async function deleteAuthorAction(
  id: string,
  reassignAuthorId?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCmsUser();
    if (!canManageAuthors(user)) {
      return { success: false, error: "Permission denied. Only Super Administrators can manage author profiles." };
    }

    await deleteAuthor(id, reassignAuthorId);

    revalidatePath("/admin/authors");
    revalidatePath("/admin/articles");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("[deleteAuthorAction Error]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete author profile." };
  }
}

/**
 * Server Action: Toggle author active state
 */
export async function toggleAuthorActiveAction(
  id: string,
  isActive: boolean
): Promise<AuthorActionResult> {
  try {
    const user = await requireCmsUser();
    if (!canManageAuthors(user)) {
      return { success: false, error: "Permission denied. Only Super Administrators can manage author profiles." };
    }

    const author = await toggleAuthorActive(id, isActive);

    revalidatePath("/admin/authors");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true, author };
  } catch (error) {
    console.error("[toggleAuthorActiveAction Error]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle author state." };
  }
}
