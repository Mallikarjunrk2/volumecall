import "server-only";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CmsUser } from "./types";
import { getCmsUserByEmail, bootstrapSuperAdmin, recordUserLogin } from "./user-service";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter((e) => e.length > 0);
}

export function isBootstrapAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  const adminEmails = getAdminEmails();
  return adminEmails.includes(normalized);
}

/**
 * Resolves the currently authenticated CMS user from session and cms_users table.
 * If user does not exist in cms_users but matches ADMIN_EMAILS, auto-provisions as SUPER_ADMIN.
 */
export async function getCurrentCmsUser(): Promise<CmsUser | null> {
  const session = await auth();
  const rawEmail = session?.user?.email;

  if (!rawEmail) return null;

  const normalizedEmail = normalizeEmail(rawEmail);
  let cmsUser = await getCmsUserByEmail(normalizedEmail);

  if (!cmsUser) {
    // Check ADMIN_EMAILS bootstrap allowlist
    if (isBootstrapAdmin(normalizedEmail)) {
      cmsUser = await bootstrapSuperAdmin(
        normalizedEmail,
        session?.user?.name,
        session?.user?.image
      );
    }
  } else {
    // Only update login timestamp if last login was over 15 minutes ago to prevent blocking DB writes on every GET
    if (cmsUser.is_active) {
      const lastLogin = cmsUser.last_login_at ? new Date(cmsUser.last_login_at).getTime() : 0;
      const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
      if (lastLogin < fifteenMinutesAgo) {
        recordUserLogin(
          cmsUser.id,
          session?.user?.name,
          session?.user?.image
        ).catch((err) => {
          console.error("[Non-blocking User Login Record Error]:", err);
        });
      }
    }
  }

  return cmsUser;
}

/**
 * Enforces that an active CMS user session is present.
 * Throws redirect to /admin/login if not authenticated, inactive, or unauthorized.
 */
export async function requireCmsUser(): Promise<CmsUser> {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const user = await getCurrentCmsUser();

  if (!user) {
    redirect("/admin/login?error=unauthorized");
  }

  if (!user.is_active) {
    redirect("/admin/login?error=inactive");
  }

  return user;
}

/**
 * Enforces that the current user has the SUPER_ADMIN role.
 */
export async function requireSuperAdmin(): Promise<CmsUser> {
  const user = await requireCmsUser();

  if (user.role !== "SUPER_ADMIN") {
    redirect("/admin?error=forbidden");
  }

  return user;
}

/**
 * Enforces that the current user has either SUPER_ADMIN or EDITOR role.
 */
export async function requireEditor(): Promise<CmsUser> {
  const user = await requireCmsUser();

  if (user.role !== "SUPER_ADMIN" && user.role !== "EDITOR") {
    redirect("/admin?error=forbidden");
  }

  return user;
}

/**
 * Backward compatibility alias for requireCmsUser().
 */
export const requireAdmin = requireCmsUser;
