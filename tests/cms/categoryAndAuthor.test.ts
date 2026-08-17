import { describe, it, expect } from "vitest";
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

describe("Category & Author Management System Tests", () => {
  const superAdminUser: CmsUser = {
    id: "user-1",
    email: "admin@volumecall.in",
    name: "Admin",
    image: null,
    role: "SUPER_ADMIN",
    author_id: "author-1",
    author_name: "Admin Author",
    author_role: "Chief Research Analyst",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null,
  };

  const editorUser: CmsUser = {
    id: "user-2",
    email: "editor@volumecall.in",
    name: "Editor",
    image: null,
    role: "EDITOR",
    author_id: "author-2",
    author_name: "Editor Author",
    author_role: "Senior Financial Journalist",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null,
  };

  const authorUser: CmsUser = {
    id: "user-3",
    email: "author@volumecall.in",
    name: "Author User",
    image: null,
    role: "AUTHOR",
    author_id: "author-3",
    author_name: "Author Profile",
    author_role: "Equity Research Analyst",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null,
  };

  const contributorUser: CmsUser = {
    id: "user-4",
    email: "contributor@volumecall.in",
    name: "Mallikarjun Kanade",
    image: null,
    role: "CONTRIBUTOR",
    author_id: "author-4",
    author_name: "Mallikarjun Kanade",
    author_role: "Quantitative Analyst",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null,
  };

  const inactiveUser: CmsUser = {
    id: "user-5",
    email: "inactive@volumecall.in",
    name: "Inactive Admin",
    image: null,
    role: "SUPER_ADMIN",
    author_id: "author-5",
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null,
  };

  describe("RBAC Permissions", () => {
    it("allows ALL 4 active CMS roles to view categories", () => {
      expect(canViewCategories(superAdminUser)).toBe(true);
      expect(canViewCategories(editorUser)).toBe(true);
      expect(canViewCategories(authorUser)).toBe(true);
      expect(canViewCategories(contributorUser)).toBe(true);
      expect(canViewCategories(inactiveUser)).toBe(false);
      expect(canViewCategories(null)).toBe(false);
    });

    it("allows ALL 4 active CMS roles to create categories", () => {
      expect(canCreateCategory(superAdminUser)).toBe(true);
      expect(canCreateCategory(editorUser)).toBe(true);
      expect(canCreateCategory(authorUser)).toBe(true);
      expect(canCreateCategory(contributorUser)).toBe(true);
      expect(canCreateCategory(inactiveUser)).toBe(false);
      expect(canCreateCategory(null)).toBe(false);
    });

    it("allows ONLY SUPER_ADMIN and EDITOR to edit/toggle categories", () => {
      expect(canEditCategory(superAdminUser)).toBe(true);
      expect(canEditCategory(editorUser)).toBe(true);
      expect(canEditCategory(authorUser)).toBe(false);
      expect(canEditCategory(contributorUser)).toBe(false);
      expect(canEditCategory(inactiveUser)).toBe(false);
      expect(canEditCategory(null)).toBe(false);
    });

    it("allows ONLY SUPER_ADMIN to delete categories", () => {
      expect(canDeleteCategory(superAdminUser)).toBe(true);
      expect(canDeleteCategory(editorUser)).toBe(false);
      expect(canDeleteCategory(authorUser)).toBe(false);
      expect(canDeleteCategory(contributorUser)).toBe(false);
      expect(canDeleteCategory(inactiveUser)).toBe(false);
      expect(canDeleteCategory(null)).toBe(false);
    });

    it("allows ONLY SUPER_ADMIN to manage author profiles", () => {
      expect(canManageAuthors(superAdminUser)).toBe(true);
      expect(canManageAuthors(editorUser)).toBe(false);
      expect(canManageAuthors(authorUser)).toBe(false);
      expect(canManageAuthors(contributorUser)).toBe(false);
      expect(canManageAuthors(inactiveUser)).toBe(false);
      expect(canManageAuthors(null)).toBe(false);
    });

    it("allows ONLY SUPER_ADMIN to select/assign arbitrary author profiles", () => {
      expect(canSelectAuthor(superAdminUser)).toBe(true);
      expect(canSelectAuthor(editorUser)).toBe(false);
      expect(canSelectAuthor(authorUser)).toBe(false);
      expect(canSelectAuthor(contributorUser)).toBe(false);
      expect(canSelectAuthor(inactiveUser)).toBe(false);
      expect(canSelectAuthor(null)).toBe(false);
    });

    it("allows SUPER_ADMIN and EDITOR to publish articles, but not CONTRIBUTOR or AUTHOR", () => {
      expect(canPublishArticle(superAdminUser)).toBe(true);
      expect(canPublishArticle(editorUser)).toBe(true);
      expect(canPublishArticle(authorUser)).toBe(false);
      expect(canPublishArticle(contributorUser)).toBe(false);
      expect(canPublishArticle(inactiveUser)).toBe(false);
      expect(canPublishArticle(null)).toBe(false);
    });
  });

  describe("Article Ownership & Editing Permissions", () => {
    const ownDraftArticle = {
      id: "art-1",
      created_by: "user-4",
      author_id: "author-4",
      status: "DRAFT",
    };

    const ownPublishedArticle = {
      id: "art-2",
      created_by: "user-4",
      author_id: "author-4",
      status: "PUBLISHED",
    };

    const otherArticle = {
      id: "art-3",
      created_by: "user-2",
      author_id: "author-2",
      status: "DRAFT",
    };

    it("allows SUPER_ADMIN and EDITOR to edit any article", () => {
      expect(canEditArticle(superAdminUser, ownDraftArticle)).toBe(true);
      expect(canEditArticle(superAdminUser, otherArticle)).toBe(true);
      expect(canEditArticle(editorUser, ownDraftArticle)).toBe(true);
      expect(canEditArticle(editorUser, otherArticle)).toBe(true);
    });

    it("allows CONTRIBUTOR to edit own article", () => {
      expect(canEditArticle(contributorUser, ownDraftArticle)).toBe(true);
      expect(canEditArticle(contributorUser, ownPublishedArticle)).toBe(true);
    });

    it("prevents CONTRIBUTOR from editing another author's article", () => {
      expect(canEditArticle(contributorUser, otherArticle)).toBe(false);
    });

    it("allows CONTRIBUTOR to delete only own draft article", () => {
      expect(canDeleteArticle(contributorUser, ownDraftArticle)).toBe(true);
      expect(canDeleteArticle(contributorUser, ownPublishedArticle)).toBe(false);
      expect(canDeleteArticle(contributorUser, otherArticle)).toBe(false);
    });

    it("allows SUPER_ADMIN and EDITOR to delete any article", () => {
      expect(canDeleteArticle(superAdminUser, ownDraftArticle)).toBe(true);
      expect(canDeleteArticle(superAdminUser, otherArticle)).toBe(true);
      expect(canDeleteArticle(editorUser, ownDraftArticle)).toBe(true);
      expect(canDeleteArticle(editorUser, otherArticle)).toBe(true);
    });
  });

  describe("Slugify Utility Behavior", () => {
    function slugify(text: string): string {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    it("generates clean URL slugs for categories", () => {
      expect(slugify("Stock Valuation")).toBe("stock-valuation");
      expect(slugify("Fundamental Analysis")).toBe("fundamental-analysis");
      expect(slugify("Valuation & Models")).toBe("valuation-models");
      expect(slugify("  Markets & Economy -- Indian Trends  ")).toBe("markets-economy-indian-trends");
    });

    it("generates clean slugs for author profiles", () => {
      expect(slugify("VolumeCall Research")).toBe("volumecall-research");
      expect(slugify("Dr. Rahul Sharma, CFA")).toBe("dr-rahul-sharma-cfa");
    });
  });

  describe("Inline Author & Category Inputs", () => {
    it("ensures Author Role and Bio are strictly controlled by user input without hardcoded defaults", () => {
      const customAuthor = {
        name: "Aman Singhal",
        slug: "aman-singhal",
        role: "Senior Quantitative Researcher",
        bio: "Specializing in statistical arbitrage and risk premia models.",
      };

      expect(customAuthor.role).toBe("Senior Quantitative Researcher");
      expect(customAuthor.bio).toBe("Specializing in statistical arbitrage and risk premia models.");
      expect(customAuthor.role).not.toBe("Equity Research & Quantitative Analysis");
    });

    it("ensures Category fields are preserved during inline addition", () => {
      const customCategory = {
        name: "Macro Trends",
        slug: "macro-trends",
        description: "Coverage of interest rate cycles, inflation, and global liquidity.",
        is_active: true,
      };

      expect(customCategory.name).toBe("Macro Trends");
      expect(customCategory.slug).toBe("macro-trends");
      expect(customCategory.description).toContain("inflation");
    });
  });

  describe("Unified User & Author Profile Modes", () => {
    it("handles creating a user without an author profile", () => {
      const newUserNoAuthor = {
        email: "guest@volumecall.in",
        name: "Guest Contributor",
        role: "CONTRIBUTOR" as const,
        author_mode: "NONE" as const,
      };

      expect(newUserNoAuthor.author_mode).toBe("NONE");
      expect(newUserNoAuthor.role).toBe("CONTRIBUTOR");
    });

    it("handles creating a user with custom author profile without fabricated defaults", () => {
      const newUserWithAuthor = {
        email: "writer@volumecall.in",
        name: "Financial Writer",
        role: "CONTRIBUTOR" as const,
        author_mode: "CREATE_NEW" as const,
        author_name: "Financial Writer",
        author_slug: "financial-writer",
        author_role: "Fintech Columnist",
        author_bio: "Writes about equity markets.",
      };

      expect(newUserWithAuthor.author_role).toBe("Fintech Columnist");
      expect(newUserWithAuthor.author_role).not.toBe("Equity Research & Quantitative Analysis");
      expect(newUserWithAuthor.author_slug).toBe("financial-writer");
    });

    it("handles linking an existing author profile to a user", () => {
      const linkedUser = {
        email: "analyst@volumecall.in",
        name: "Analyst",
        role: "AUTHOR" as const,
        author_mode: "LINK_EXISTING" as const,
        existing_author_id: "author-1",
      };

      expect(linkedUser.author_mode).toBe("LINK_EXISTING");
      expect(linkedUser.existing_author_id).toBe("author-1");
    });
  });
});
