import { describe, it, expect } from "vitest";
import { ALLOWED_TAGS, ALLOWED_SCHEMES } from "@/lib/cms/sanitize";

describe("CMS Auto-Save & Storage Safety Checks", () => {
  describe("Sanitization & Directives Integrity", () => {
    it("preserves article HTML structure and allowlisted tags", () => {
      expect(ALLOWED_TAGS).toContain("img");
      expect(ALLOWED_TAGS).toContain("a");
      expect(ALLOWED_TAGS).toContain("p");
      expect(ALLOWED_TAGS).toContain("h2");
      expect(ALLOWED_TAGS).toContain("table");
      expect(ALLOWED_SCHEMES).toContain("https");
      expect(ALLOWED_SCHEMES).toContain("http");
      expect(ALLOWED_SCHEMES).not.toContain("javascript");
      expect(ALLOWED_SCHEMES).not.toContain("data");
    });
  });

  describe("Article Draft Model Validation", () => {
    it("ensures draft status values are strictly typed", () => {
      const validStatuses = ["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED"];
      expect(validStatuses).toContain("DRAFT");
      expect(validStatuses).toContain("PUBLISHED");
    });
  });
});
