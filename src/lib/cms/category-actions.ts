"use server";

import { requireCmsUser } from "./auth";
import {
  canCreateCategory,
  canEditCategory,
  canDeleteCategory,
} from "./permissions";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  getCategoryBySlug,
  getCategoryById,
} from "./service";
import { ArticleCategory, ArticleCategoryInput } from "./types";
import { revalidatePath } from "next/cache";

export interface CategoryActionResult {
  success: boolean;
  category?: ArticleCategory;
  error?: string;
}

/**
 * Server Action: Create a new category
 */
export async function createCategoryAction(input: ArticleCategoryInput): Promise<CategoryActionResult> {
  try {
    const user = await requireCmsUser();
    if (!canCreateCategory(user)) {
      return { success: false, error: "Permission denied. You do not have permission to create categories." };
    }

    const name = input.name?.trim();
    const slug = input.slug?.trim();

    if (!name || !slug) {
      return { success: false, error: "Category name and slug are required." };
    }

    const existingSlug = await getCategoryBySlug(slug);
    if (existingSlug) {
      return { success: false, error: `A category with the slug "${slug}" already exists.` };
    }

    const category = await createCategory({
      name,
      slug,
      description: input.description?.trim() || null,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active !== false,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true, category };
  } catch (error) {
    console.error("[createCategoryAction Error]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create category." };
  }
}

/**
 * Server Action: Update an existing category
 */
export async function updateCategoryAction(
  id: string,
  input: ArticleCategoryInput
): Promise<CategoryActionResult> {
  try {
    const user = await requireCmsUser();
    if (!canEditCategory(user)) {
      return { success: false, error: "Permission denied. Only Super Administrators and Editors can edit categories." };
    }

    const name = input.name?.trim();
    const slug = input.slug?.trim();

    if (!name || !slug) {
      return { success: false, error: "Category name and slug are required." };
    }

    const existing = await getCategoryById(id);
    if (!existing) {
      return { success: false, error: "Category not found." };
    }

    if (slug !== existing.slug) {
      const duplicateSlug = await getCategoryBySlug(slug);
      if (duplicateSlug) {
        return { success: false, error: `A category with the slug "${slug}" already exists.` };
      }
    }

    const category = await updateCategory(id, {
      name,
      slug,
      description: input.description?.trim() || null,
      sort_order: input.sort_order ?? existing.sort_order,
      is_active: input.is_active !== undefined ? input.is_active : existing.is_active,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true, category };
  } catch (error) {
    console.error("[updateCategoryAction Error]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update category." };
  }
}

/**
 * Server Action: Delete category safely with optional article reassignment
 */
export async function deleteCategoryAction(
  id: string,
  reassignCategoryId?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCmsUser();
    if (!canDeleteCategory(user)) {
      return { success: false, error: "Permission denied. Only Super Administrators can delete categories." };
    }

    await deleteCategory(id, reassignCategoryId);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("[deleteCategoryAction Error]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete category." };
  }
}

/**
 * Server Action: Toggle category active state
 */
export async function toggleCategoryActiveAction(
  id: string,
  isActive: boolean
): Promise<CategoryActionResult> {
  try {
    const user = await requireCmsUser();
    if (!canEditCategory(user)) {
      return { success: false, error: "Permission denied. Only Super Administrators and Editors can change category status." };
    }

    const category = await toggleCategoryActive(id, isActive);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true, category };
  } catch (error) {
    console.error("[toggleCategoryActiveAction Error]:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle category state." };
  }
}
