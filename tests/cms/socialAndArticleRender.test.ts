import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "@/lib/cms/sanitize";
import { validateSocialEmbed, parseYouTubeUrl, parseXPostUrl, parseInstagramUrl } from "@/lib/cms/social-registry";
import { extractTocHeadings } from "@/components/blog/ArticleContentCompiler";

describe("CMS Sanitization & Social Registry", () => {
  describe("sanitizeHtml", () => {
    it("strips script tags and event handlers", () => {
      const malicious = '<p>Safe paragraph</p><script>alert("hack")</script><a href="javascript:alert(1)" onclick="steal()">Click</a>';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("onclick");
      expect(clean).not.toContain("javascript:");
      expect(clean).toContain("<p>Safe paragraph</p>");
    });

    it("preserves safe HTML elements", () => {
      const safe = '<h2>Heading</h2><p>Text with <strong>bold</strong> and <em>italic</em>.</p>';
      const clean = sanitizeHtml(safe);
      expect(clean).toBe(safe);
    });
  });

  describe("validateSocialEmbed", () => {
    it("validates and parses YouTube URLs", () => {
      const normal = parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(normal).not.toBeNull();
      expect(normal?.embedId).toBe("dQw4w9WgXcQ");
      expect(normal?.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");

      const short = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ");
      expect(short?.embedId).toBe("dQw4w9WgXcQ");

      const shorts = parseYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ");
      expect(shorts?.embedId).toBe("dQw4w9WgXcQ");
    });

    it("validates and parses X/Twitter URLs", () => {
      const xUrl = parseXPostUrl("https://x.com/TataCompanies/status/189123456789");
      expect(xUrl).not.toBeNull();
      expect(xUrl?.authorOrUser).toBe("TataCompanies");
      expect(xUrl?.embedId).toBe("189123456789");
    });

    it("validates and parses Instagram URLs", () => {
      const igPost = parseInstagramUrl("https://www.instagram.com/p/Db7zI-PABx5/");
      expect(igPost).not.toBeNull();
      expect(igPost?.type).toBe("post");
      expect(igPost?.embedId).toBe("Db7zI-PABx5");

      const igReel = parseInstagramUrl("https://www.instagram.com/reel/Db7zI-PABx5/");
      expect(igReel?.type).toBe("reel");
    });

    it("strictly rejects malicious / non-whitelisted URLs", () => {
      expect(validateSocialEmbed("youtube", "https://evil.com/video")).toBeNull();
      expect(validateSocialEmbed("x", "javascript:alert(1)")).toBeNull();
      expect(validateSocialEmbed("instagram", "https://fake-instagram.com/p/123")).toBeNull();
      expect(validateSocialEmbed("unknown", "https://x.com/user/status/123")).toBeNull();
    });
  });

  describe("extractTocHeadings", () => {
    it("extracts H2 and H3 headings cleanly", () => {
      const md = `
# Title
Intro text

## First Section
Content

### Subsection
More content

## Second Section
Conclusion
      `;
      const headings = extractTocHeadings(md);
      expect(headings.length).toBe(3);
      expect(headings[0]).toEqual({ id: "first-section", text: "First Section", level: 2 });
      expect(headings[1]).toEqual({ id: "subsection", text: "Subsection", level: 3 });
      expect(headings[2]).toEqual({ id: "second-section", text: "Second Section", level: 2 });
    });
  });
});
