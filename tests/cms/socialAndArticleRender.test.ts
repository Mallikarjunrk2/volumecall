import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "@/lib/cms/sanitize";
import {
  validateSocialEmbed,
  parseYouTubeUrl,
  parseXPostUrl,
  parseInstagramUrl,
} from "@/lib/cms/social-registry";
import { extractTocHeadings } from "@/components/blog/ArticleContentCompiler";

describe("CMS Sanitization & Social Registry Security Tests", () => {
  describe("sanitizeHtml - Strict Security Allowlist", () => {
    // 1. <script>alert('xss')</script>
    it("removes script tags and script contents", () => {
      const input = "<script>alert('xss')</script>";
      const clean = sanitizeHtml(input);
      expect(clean).toBe("");
    });

    // 2. <img src=x onerror=alert('xss')>
    it("strips onerror event handlers from img tags", () => {
      const input = "<img src=x onerror=alert('xss')>";
      const clean = sanitizeHtml(input);
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("alert");
    });

    // 3. <a href="javascript:alert('xss')">Click</a>
    it("strips javascript: protocol from links", () => {
      const input = '<a href="javascript:alert(\'xss\')">Click</a>';
      const clean = sanitizeHtml(input);
      expect(clean).not.toContain("javascript:");
      expect(clean).toContain("Click");
      expect(clean).not.toContain("href");
    });

    // 4. <a href="data:text/html,<script>alert(1)</script>">Click</a>
    it("strips data: protocol from links", () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
      const clean = sanitizeHtml(input);
      expect(clean).not.toContain("data:");
      expect(clean).not.toContain("<script>");
      expect(clean).toContain("Click");
    });

    // 5. <iframe src="https://evil.example"></iframe>
    it("discards raw iframe tags to prevent unapproved iframe injection", () => {
      const input = '<iframe src="https://evil.example"></iframe>';
      const clean = sanitizeHtml(input);
      expect(clean).toBe("");
    });

    // 6. <object data="evil"></object>
    it("discards object and embed tags", () => {
      const input = '<object data="evil"></object><embed src="evil.swf">';
      const clean = sanitizeHtml(input);
      expect(clean).toBe("");
    });

    // 7. <svg onload="alert(1)"></svg>
    it("discards svg and math tags with event handlers", () => {
      const input = '<svg onload="alert(1)"><circle r="10"/></svg>';
      const clean = sanitizeHtml(input);
      expect(clean).toBe("");
    });

    // 8. <div onclick="alert(1)">Text</div>
    it("strips inline event handlers while preserving safe tag text", () => {
      const input = '<div onclick="alert(1)" onmouseover="steal()" onfocus="bad()">Text</div>';
      const clean = sanitizeHtml(input);
      expect(clean).not.toContain("onclick");
      expect(clean).not.toContain("onmouseover");
      expect(clean).not.toContain("onfocus");
      expect(clean).toContain("<div>Text</div>");
    });

    // 9. <a href="https://example.com">Safe link</a>
    it("preserves valid HTTPS links and adds secure rel attributes", () => {
      const input = '<a href="https://example.com">Safe link</a>';
      const clean = sanitizeHtml(input);
      expect(clean).toContain('href="https://example.com"');
      expect(clean).toContain('rel="noopener noreferrer"');
      expect(clean).toContain("Safe link");
    });

    // 10. <img src="https://example.com/image.jpg" alt="Safe image">
    it("preserves valid images with src and alt attributes", () => {
      const input = '<img src="https://example.com/image.jpg" alt="Safe image" width="600" height="400">';
      const clean = sanitizeHtml(input);
      expect(clean).toContain('src="https://example.com/image.jpg"');
      expect(clean).toContain('alt="Safe image"');
      expect(clean).toContain('width="600"');
      expect(clean).toContain('height="400"');
    });

    // 11. Normal Markdown-generated headings, paragraphs, lists, tables, and emphasis
    it("preserves full standard markdown HTML elements including heading IDs", () => {
      const input = `
<h2 id="key-insights">Key Insights</h2>
<p>Here is a paragraph with <strong>bold</strong>, <em>italic</em>, <code>inline code</code>, and <del>strikethrough</del>.</p>
<blockquote>A famous quote</blockquote>
<ul><li>Item 1</li><li>Item 2</li></ul>
<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>
<hr />
      `.trim();
      const clean = sanitizeHtml(input);
      expect(clean).toContain('<h2 id="key-insights">Key Insights</h2>');
      expect(clean).toContain("<strong>bold</strong>");
      expect(clean).toContain("<em>italic</em>");
      expect(clean).toContain("<code>inline code</code>");
      expect(clean).toContain("<blockquote>A famous quote</blockquote>");
      expect(clean).toContain("<ul><li>Item 1</li><li>Item 2</li></ul>");
      expect(clean).toContain("<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>");
      expect(clean).toContain("<hr />");
    });
  });

  describe("Social Embed Registry Validation (Attack & Normal Cases)", () => {
    it("validates and normalizes YouTube URLs", () => {
      const normal = parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(normal).not.toBeNull();
      expect(normal?.embedId).toBe("dQw4w9WgXcQ");
      expect(normal?.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");

      const short = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ");
      expect(short?.embedId).toBe("dQw4w9WgXcQ");

      const shorts = parseYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ");
      expect(shorts?.embedId).toBe("dQw4w9WgXcQ");
    });

    it("validates and normalizes X / Twitter URLs", () => {
      const xUrl = parseXPostUrl("https://x.com/TataCompanies/status/189123456789");
      expect(xUrl).not.toBeNull();
      expect(xUrl?.authorOrUser).toBe("TataCompanies");
      expect(xUrl?.embedId).toBe("189123456789");

      const twitterUrl = parseXPostUrl("https://twitter.com/TataCompanies/status/189123456789");
      expect(twitterUrl).not.toBeNull();
      expect(twitterUrl?.embedId).toBe("189123456789");
    });

    it("validates and normalizes Instagram Post & Reel URLs", () => {
      const igPost = parseInstagramUrl("https://www.instagram.com/p/Db7zI-PABx5/");
      expect(igPost).not.toBeNull();
      expect(igPost?.type).toBe("post");
      expect(igPost?.embedId).toBe("Db7zI-PABx5");

      const igReel = parseInstagramUrl("https://www.instagram.com/reel/Db7zI-PABx5/");
      expect(igReel?.type).toBe("reel");
      expect(igReel?.embedId).toBe("Db7zI-PABx5");
    });

    it("strictly rejects malicious, javascript, or non-whitelisted domains", () => {
      expect(validateSocialEmbed("youtube", "https://evil-site.com/watch?v=123")).toBeNull();
      expect(validateSocialEmbed("x", "javascript:alert(1)")).toBeNull();
      expect(validateSocialEmbed("instagram", "https://phishing-instagram.com/p/123")).toBeNull();
      expect(validateSocialEmbed("unknown", "https://x.com/user/status/123")).toBeNull();
    });
  });

  describe("TOC Heading Extraction", () => {
    it("extracts clean H2 and H3 headings from markdown", () => {
      const md = `
# Main Title
Intro

## What Happened
Details here

### Market Reaction
More details

## Valuation Analysis
Conclusions
      `;
      const headings = extractTocHeadings(md);
      expect(headings.length).toBe(3);
      expect(headings[0]).toEqual({ id: "what-happened", text: "What Happened", level: 2 });
      expect(headings[1]).toEqual({ id: "market-reaction", text: "Market Reaction", level: 3 });
      expect(headings[2]).toEqual({ id: "valuation-analysis", text: "Valuation Analysis", level: 2 });
    });
  });
});
