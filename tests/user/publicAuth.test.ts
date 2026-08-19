import { describe, it, expect } from "vitest";
import { normalizeEmail } from "@/lib/user/utils";
import { PublicUser } from "@/lib/user/types";
import {
  canViewCategories,
  canCreateCategory,
  canEditCategory,
  canDeleteCategory,
  canManageAuthors,
  canSelectAuthor,
  canEditArticle,
  canDeleteArticle,
  canPublishArticle,
} from "@/lib/cms/permissions";
import { CmsUser } from "@/lib/cms/types";

describe("Public User Authentication & CMS Isolation Tests", () => {
  describe("Email Normalization", () => {
    it("lowercases and trims emails consistently", () => {
      expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
      expect(normalizeEmail("Trader.Pro@VolumeCall.in")).toBe("trader.pro@volumecall.in");
    });
  });

  describe("Public User Schema & Contracts", () => {
    it("conforms to the PublicUser interface", () => {
      const publicUser: PublicUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        google_id: "google_1234567890",
        email: "investor@example.com",
        name: "Retail Investor",
        image: "https://lh3.googleusercontent.com/a/default-user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };

      expect(publicUser.id).toBeDefined();
      expect(publicUser.email).toBe("investor@example.com");
      expect(publicUser.google_id).toBe("google_1234567890");
    });
  });

  describe("Complete Isolation from CMS RBAC", () => {
    it("ensures public users cannot perform any CMS administrative action", () => {
      // Null CMS user (e.g. unauthenticated in CMS or public-only user)
      const unauthenticatedCmsUser: CmsUser | null = null;

      expect(canViewCategories(unauthenticatedCmsUser)).toBe(false);
      expect(canCreateCategory(unauthenticatedCmsUser)).toBe(false);
      expect(canEditCategory(unauthenticatedCmsUser)).toBe(false);
      expect(canDeleteCategory(unauthenticatedCmsUser)).toBe(false);
      expect(canManageAuthors(unauthenticatedCmsUser)).toBe(false);
      expect(canSelectAuthor(unauthenticatedCmsUser)).toBe(false);
      expect(canEditArticle(unauthenticatedCmsUser, { author_id: "some-author-id" })).toBe(false);
      expect(canDeleteArticle(unauthenticatedCmsUser, { author_id: "some-author-id" })).toBe(false);
      expect(canPublishArticle(unauthenticatedCmsUser)).toBe(false);
    });

    it("ensures inactive CMS accounts remain locked out regardless of public session", () => {
      const inactiveCmsUser: CmsUser = {
        id: "inactive-1",
        email: "deactivated@volumecall.in",
        name: "Deactivated Analyst",
        image: null,
        role: "SUPER_ADMIN",
        author_id: null,
        author_name: null,
        author_role: null,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: null,
      };

      expect(canViewCategories(inactiveCmsUser)).toBe(false);
      expect(canCreateCategory(inactiveCmsUser)).toBe(false);
      expect(canEditCategory(inactiveCmsUser)).toBe(false);
      expect(canDeleteCategory(inactiveCmsUser)).toBe(false);
      expect(canManageAuthors(inactiveCmsUser)).toBe(false);
      expect(canSelectAuthor(inactiveCmsUser)).toBe(false);
      expect(canEditArticle(inactiveCmsUser, { author_id: "any" })).toBe(false);
      expect(canDeleteArticle(inactiveCmsUser, { author_id: "any" })).toBe(false);
      expect(canPublishArticle(inactiveCmsUser)).toBe(false);
    });
  });
});
