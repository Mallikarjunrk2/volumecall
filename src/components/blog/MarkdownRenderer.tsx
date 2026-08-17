import React from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Custom marked renderer to generate clean, URL-safe heading IDs for Table of Contents anchor links
const renderer = new marked.Renderer();

renderer.heading = function ({ text, depth }) {
  const cleanText = text.replace(/<[^>]+>/g, "");
  const id = cleanText
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `<h${depth} id="${id}">${text}</h${depth}>\n`;
};

// Configure marked with GitHub-flavored markdown and heading IDs
marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const rawHtml = (marked.parse(content || "") as string) || "";

  // Sanitize HTML strictly before rendering
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "strong", "em", "b", "i", "u", "strike", "del", "s",
      "ul", "ol", "li", "blockquote", "pre", "code",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      "a", "img", "hr", "br", "span", "div", "sub", "sup", "kbd",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "target", "rel", "width", "height", "align", "id",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  });

  return (
    <div
      className={`article-markdown-body w-full max-w-none leading-relaxed text-[var(--text-primary)] ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default MarkdownRenderer;
