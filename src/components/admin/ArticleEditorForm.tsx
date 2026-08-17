"use client";

import { useState, useRef } from "react";
import {
  Article,
  ArticleCategory,
  ArticleInput,
  ArticleStatus,
  Author,
  CmsUserRole,
  ArticleSource,
} from "@/lib/cms/types";
import { createArticleAction, updateArticleAction } from "@/lib/cms/actions";
import { ArticleContentCompiler } from "@/components/blog/ArticleContentCompiler";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ArticleToolbar } from "@/components/admin/ArticleToolbar";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  ArrowLeft,
  Eye,
  Edit2,
  Plus,
  Trash2,
  Tag,
  Link2,
} from "lucide-react";

interface Props {
  initialArticle?: Article | null;
  categories: ArticleCategory[];
  authors: Author[];
  userRole?: CmsUserRole;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ArticleEditorForm({
  initialArticle,
  categories,
  authors,
  userRole = "SUPER_ADMIN",
}: Props) {
  const isEditing = !!initialArticle;

  const [title, setTitle] = useState(initialArticle?.title || "");
  const [slug, setSlug] = useState(initialArticle?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [contentMarkdown, setContentMarkdown] = useState(initialArticle?.content_markdown || "");
  const [featuredImage, setFeaturedImage] = useState(initialArticle?.featured_image || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialArticle?.featured_image_alt || "");
  const [categoryId, setCategoryId] = useState(initialArticle?.category_id || categories[0]?.id || "");
  const [authorId, setAuthorId] = useState(initialArticle?.author_id || authors[0]?.id || "");
  const [status, setStatus] = useState<ArticleStatus>(initialArticle?.status || "DRAFT");
  const [scheduledAt, setScheduledAt] = useState(
    initialArticle?.scheduled_at ? new Date(initialArticle.scheduled_at).toISOString().slice(0, 16) : ""
  );
  const [metaTitle, setMetaTitle] = useState(initialArticle?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialArticle?.meta_description || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialArticle?.canonical_url || "");
  const [ogImage, setOgImage] = useState(initialArticle?.og_image || "");

  // Preserved legacy metadata fields (backward compatibility)
  const relatedCalculators = initialArticle?.related_calculators || [];
  const relatedSymbolsInput = (initialArticle?.related_symbols || []).join(", ");
  const [tagsInput, setTagsInput] = useState<string>(
    (initialArticle?.tags || []).join(", ")
  );
  const [sources, setSources] = useState<ArticleSource[]>(
    initialArticle?.sources_json || []
  );

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertText = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContentMarkdown((prev) => `${prev}\n\n${snippet}\n\n`);
      return;
    }

    const start = textarea.selectionStart ?? contentMarkdown.length;
    const end = textarea.selectionEnd ?? contentMarkdown.length;
    const before = contentMarkdown.slice(0, start);
    const after = contentMarkdown.slice(end);

    const newContent = `${before}${snippet}${after}`;
    setContentMarkdown(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + snippet.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const canPublish = userRole === "SUPER_ADMIN" || userRole === "EDITOR";

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleAddSource = () => {
    setSources((prev) => [...prev, { title: "", url: "" }]);
  };

  const handleUpdateSource = (index: number, field: "title" | "url", value: string) => {
    setSources((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (submitStatus?: ArticleStatus) => {
    if (!title.trim() || !slug.trim() || !contentMarkdown.trim()) {
      alert("Please fill in the required fields: Title, Slug, and Article Content.");
      return;
    }

    setSubmitting(true);
    const finalStatus = submitStatus || status;

    // Parse and normalize symbols and tags
    const symbols = relatedSymbolsInput
      .split(/[, ]+/)
      .map((s) => s.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
      .filter(Boolean)
      .slice(0, 5);

    const tags = tagsInput
      .split(/[,]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const validSources = sources
      .map((s) => ({ title: s.title.trim(), url: s.url.trim() }))
      .filter((s) => s.title && s.url);

    const payload: ArticleInput = {
      title,
      slug,
      excerpt,
      content_markdown: contentMarkdown,
      featured_image: featuredImage.trim() || null,
      featured_image_alt: featuredImageAlt.trim() || null,
      category_id: categoryId || null,
      author_id: authorId || null,
      status: finalStatus,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      canonical_url: canonicalUrl.trim() || null,
      og_image: ogImage.trim() || null,
      related_calculators: relatedCalculators,
      related_symbols: symbols,
      tags,
      sources_json: validSources,
    };

    try {
      if (isEditing && initialArticle?.id) {
        await updateArticleAction(initialArticle.id, payload);
      } else {
        await createArticleAction(payload);
      }
    } catch (err) {
      console.error("Failed to save article:", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16">
      {/* ─── Top Bar Actions ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {isEditing ? "Edit Publication" : "New Publication"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {isEditing ? `Editing /${slug}` : "Draft a new financial research article."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing && initialArticle?.status === "PUBLISHED" && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-[var(--border-subtle)] rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Public</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSubmit("DRAFT")}
            disabled={submitting}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] rounded-md text-xs font-semibold text-[var(--text-primary)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {canPublish && (
            <button
              type="button"
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={submitting}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#2DD4BF] dark:hover:bg-[#20D6C2] text-white dark:text-black font-semibold text-xs rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Two-Column Form Layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Editor & Research Citations (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Understanding CAGR: How to Measure Investment Returns"
              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-[11px] text-[var(--accent-teal)] hover:underline"
              >
                {autoSlug ? "Manual Slug" : "Auto Slug"}
              </button>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-[var(--text-muted)] font-mono">/blog/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(e.target.value);
                }}
                placeholder="understanding-cagr"
                className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Article Excerpt / Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="A concise summary of the research paper for article lists and search engines."
              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
            />
          </div>

          {/* Editor Tabs: Write / Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Article Body (Markdown & Safe VolumeCall Directives) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1 bg-[var(--bg-surface)] p-0.5 rounded-md border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === "write"
                      ? "bg-[var(--accent-teal)] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === "preview"
                      ? "bg-[var(--accent-teal)] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {activeTab === "write" ? (
              <div className="space-y-2">
                <ArticleToolbar onInsertText={handleInsertText} />
                <textarea
                  ref={textareaRef}
                  required
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  rows={18}
                  placeholder={`Write your research in GitHub Markdown...\n\nUse H2/H3 for auto-generated Table of Contents:\n## Introduction\n### Key Formulas\n\nInsert rich interactive directives:\n:::tip[Analyst Insight]\nCAGR smooths geometric growth...\n:::\n\n::calculator{id="cagr-calculator"}\n\n::stock{symbol="RELIANCE"}`}
                  className="w-full p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md font-mono text-xs text-[var(--text-primary)] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            ) : (
              <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md min-h-[400px]">
                <ArticleContentCompiler
                  content={contentMarkdown}
                  articleTitle={title}
                />
              </div>
            )}
          </div>

          {/* Sources & References Editor */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-[var(--accent-teal)]" />
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Sources & References
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddSource}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)] text-[11px] font-medium text-[var(--accent-teal)] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Source</span>
              </button>
            </div>

            {sources.length === 0 ? (
              <p className="text-[11px] text-[var(--text-muted)] italic">
                No external citations added. Click &ldquo;Add Source&rdquo; to attach annual reports, regulatory filings, or data sources.
              </p>
            ) : (
              <div className="space-y-2">
                {sources.map((src, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Source Name (e.g. NSE / Annual Report)"
                      value={src.title}
                      onChange={(e) => handleUpdateSource(idx, "title", e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={src.url}
                      onChange={(e) => handleUpdateSource(idx, "url", e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(idx)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      title="Remove source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Publishing, Related Calculators, Stocks, Tags, SEO (1 col) */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Publication Settings
            </h3>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              >
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="REVIEW">IN REVIEW</option>
                {canPublish && <option value="SCHEDULED">SCHEDULED</option>}
                {canPublish && <option value="PUBLISHED">PUBLISHED (Public)</option>}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Author Profile
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              >
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name} ({author.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Date */}
            {status === "SCHEDULED" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Scheduled Publish Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            )}
          </div>

          {/* Featured Image */}
          <ImageUploader
            value={featuredImage}
            altText={featuredImageAlt}
            onChange={(url, alt) => {
              setFeaturedImage(url);
              if (alt !== undefined) {
                setFeaturedImageAlt(alt);
              }
            }}
            onAltTextChange={(alt) => setFeaturedImageAlt(alt)}
          />

          {/* Tags */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-[var(--accent-teal)]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Article Tags
              </h3>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-muted)]">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Valuation, Fundamental Analysis, Compounding"
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>
          </div>

          {/* SEO & Social Metadata */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              SEO & Social Metadata
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Custom Meta Title"}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                placeholder={excerpt || "Search engine description"}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Canonical URL
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder={`https://volumecall.in/blog/${slug}`}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                OG Social Image URL
              </label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder={featuredImage || "https://volumecall.in/og.png"}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleEditorForm;
