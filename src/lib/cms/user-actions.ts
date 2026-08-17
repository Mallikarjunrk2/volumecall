"use server";

import { requireSuperAdmin } from "./auth";
import {
  createCmsUser,
  createUnifiedCmsUser,
  updateCmsUserRole,
  updateCmsUserStatus,
  updateCmsUserAuthor,
  updateUnifiedCmsUser,
  deleteCmsUser,
  countActiveSuperAdmins,
  getCmsUserById,
} from "./user-service";
import { CmsUser, CmsUserRole, UnifiedUserInput } from "./types";
import { isValidRole } from "./permissions";
import { revalidatePath } from "next/cache";

export interface UserActionResult {
  success: boolean;
  error?: string;
}

export interface UnifiedUserActionResult {
  success: boolean;
  user?: CmsUser;
  error?: string;
}

export async function saveUnifiedUserAction(input: UnifiedUserInput): Promise<UnifiedUserActionResult> {
  try {
    await requireSuperAdmin();

    if (!input.id) {
      return { success: false, error: "User ID is required." };
    }

    const updatedUser = await updateUnifiedCmsUser(input);

    revalidatePath("/admin/users");
    revalidatePath("/admin/articles");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true, user: updatedUser };
  } catch (error: unknown) {
    console.error("[saveUnifiedUserAction Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to update user.";
    return { success: false, error: message };
  }
}

export async function createUnifiedUserAction(input: UnifiedUserInput): Promise<UnifiedUserActionResult> {
  try {
    await requireSuperAdmin();

    const email = input.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }

    const createdUser = await createUnifiedCmsUser({
      ...input,
      email,
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/articles");
    revalidatePath("/admin/articles/new");
    revalidatePath("/blog");
    return { success: true, user: createdUser };
  } catch (error: unknown) {
    console.error("[createUnifiedUserAction Error]:", error);
    const err = error as { message?: string; code?: string };
    if (err?.message?.includes("unique constraint") || err?.code === "23505") {
      return { success: false, error: "A CMS user with this email already exists." };
    }
    return { success: false, error: err?.message || "Failed to create CMS user." };
  }
}

export async function createUserAction(formData: FormData): Promise<UserActionResult> {
  try {
    await requireSuperAdmin();

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const name = String(formData.get("name") || "").trim();
    const roleRaw = String(formData.get("role") || "").trim();
    const authorIdRaw = String(formData.get("authorId") || "").trim();

    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }

    if (!isValidRole(roleRaw)) {
      return { success: false, error: "Invalid role selected." };
    }

    const role = roleRaw as CmsUserRole;

    await createCmsUser({
      email,
      name: name || null,
      role,
      author_id: authorIdRaw || null,
      is_active: true,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("[createUserAction Error]:", error);
    const err = error as { message?: string; code?: string };
    if (err?.message?.includes("unique constraint") || err?.code === "23505") {
      return { success: false, error: "A CMS user with this email already exists." };
    }
    return { success: false, error: err?.message || "Failed to create CMS user." };
  }
}

export async function updateUserAuthorAction(
  userId: string,
  authorId: string | null
): Promise<UserActionResult> {
  try {
    await requireSuperAdmin();

    const targetUser = await getCmsUserById(userId);
    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    await updateCmsUserAuthor(userId, authorId || null);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("[updateUserAuthorAction Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to update author link.";
    return { success: false, error: message };
  }
}

export async function updateUserRoleAction(
  userId: string,
  newRole: string
): Promise<UserActionResult> {
  try {
    await requireSuperAdmin();

    if (!isValidRole(newRole)) {
      return { success: false, error: "Invalid role specified." };
    }

    const targetUser = await getCmsUserById(userId);
    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    // Safety: Prevent removing final active SUPER_ADMIN
    if (targetUser.role === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
      const activeSuperCount = await countActiveSuperAdmins();
      if (activeSuperCount <= 1) {
        return {
          success: false,
          error: "Cannot change role of the final active Super Administrator.",
        };
      }
    }

    await updateCmsUserRole(userId, newRole as CmsUserRole);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("[updateUserRoleAction Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to update role.";
    return { success: false, error: message };
  }
}

export async function updateUserStatusAction(
  userId: string,
  isActive: boolean
): Promise<UserActionResult> {
  try {
    const currentAdmin = await requireSuperAdmin();

    const targetUser = await getCmsUserById(userId);
    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    // Safety: Prevent deactivating yourself
    if (currentAdmin.id === userId && !isActive) {
      return { success: false, error: "You cannot deactivate your own account." };
    }

    // Safety: Prevent deactivating the final active SUPER_ADMIN
    if (targetUser.role === "SUPER_ADMIN" && !isActive) {
      const activeSuperCount = await countActiveSuperAdmins();
      if (activeSuperCount <= 1) {
        return {
          success: false,
          error: "Cannot deactivate the final active Super Administrator.",
        };
      }
    }

    await updateCmsUserStatus(userId, isActive);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("[updateUserStatusAction Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to update status.";
    return { success: false, error: message };
  }
}

export async function deleteUserAction(userId: string): Promise<UserActionResult> {
  try {
    const currentAdmin = await requireSuperAdmin();

    const targetUser = await getCmsUserById(userId);
    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    // Safety: Prevent self-deletion
    if (currentAdmin.id === userId) {
      return { success: false, error: "You cannot delete your own account." };
    }

    // Safety: Prevent deleting the final active SUPER_ADMIN
    if (targetUser.role === "SUPER_ADMIN") {
      const activeSuperCount = await countActiveSuperAdmins();
      if (activeSuperCount <= 1) {
        return {
          success: false,
          error: "Cannot delete the final Super Administrator.",
        };
      }
    }

    await deleteCmsUser(userId);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    console.error("[deleteUserAction Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to delete user.";
    return { success: false, error: message };
  }
}
