import React from "react";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/cms/sanitize";

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
  const cleanHtml = sanitizeHtml(rawHtml);

  return (
    <div
      className={`article-markdown-body w-full max-w-none leading-relaxed text-[var(--text-primary)] ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

export default MarkdownRenderer;
