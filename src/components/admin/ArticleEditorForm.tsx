"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Article,
  ArticleCategory,
  ArticleInput,
  ArticleStatus,
  Author,
  CmsUserRole,
  ArticleSource,
} from "@/lib/cms/types";
import {
  saveArticleDraftAction,
  saveAndPublishArticleAction,
} from "@/lib/cms/actions";
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
  Loader2,
  Check,
  AlertCircle,
  AlertTriangle,
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
  const router = useRouter();
  const [articleId, setArticleId] = useState<string | null>(initialArticle?.id || null);

  const [title, setTitle] = useState(initialArticle?.title || "");
  const [slug, setSlug] = useState(initialArticle?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!initialArticle);
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

  // Preserved metadata fields
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "unsaved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [timeAgoText, setTimeAgoText] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Navigation confirmation modal state
  const [showNavModal, setShowNavModal] = useState<boolean>(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const pendingSaveRef = useRef<boolean>(false);

  // Latest state ref for reliable auto-save payloads without stale closures
  const stateRef = useRef({
    title,
    slug,
    excerpt,
    contentMarkdown,
    featuredImage,
    featuredImageAlt,
    categoryId,
    authorId,
    status,
    scheduledAt,
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImage,
    tagsInput,
    sources,
    articleId,
    relatedCalculators,
    relatedSymbolsInput,
  });

  useEffect(() => {
    stateRef.current = {
      title,
      slug,
      excerpt,
      contentMarkdown,
      featuredImage,
      featuredImageAlt,
      categoryId,
      authorId,
      status,
      scheduledAt,
      metaTitle,
      metaDescription,
      canonicalUrl,
      ogImage,
      tagsInput,
      sources,
      articleId,
      relatedCalculators,
      relatedSymbolsInput,
    };
  });

  // Construct payload from latest state
  const buildPayload = (customStatus?: ArticleStatus): ArticleInput => {
    const s = stateRef.current;
    const finalStatus = customStatus || s.status;

    const symbols = s.relatedSymbolsInput
      .split(/[, ]+/)
      .map((sym) => sym.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
      .filter(Boolean)
      .slice(0, 5);

    const tags = s.tagsInput
      .split(/[,]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const validSources = s.sources
      .map((src) => ({ title: src.title.trim(), url: src.url.trim() }))
      .filter((src) => src.title && src.url);

    return {
      title: s.title.trim() || "Untitled Draft",
      slug: s.slug.trim() || slugify(s.title) || "draft-untitled",
      excerpt: s.excerpt.trim(),
      content_markdown: s.contentMarkdown,
      featured_image: s.featuredImage.trim() || null,
      featured_image_alt: s.featuredImageAlt.trim() || null,
      category_id: s.categoryId || null,
      author_id: s.authorId || null,
      status: finalStatus,
      scheduled_at: s.scheduledAt ? new Date(s.scheduledAt).toISOString() : null,
      meta_title: s.metaTitle.trim() || null,
      meta_description: s.metaDescription.trim() || null,
      canonical_url: s.canonicalUrl.trim() || null,
      og_image: s.ogImage.trim() || null,
      related_calculators: s.relatedCalculators,
      related_symbols: symbols,
      tags,
      sources_json: validSources,
    };
  };

  // Core save function
  const performSave = async (isManual = false, isPublish = false): Promise<boolean> => {
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return false;
    }

    const s = stateRef.current;
    // If auto-saving an empty document, skip
    if (!isManual && !isPublish && !s.title.trim() && !s.contentMarkdown.trim()) {
      return false;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");
    setSaveError(null);

    const targetId = s.articleId || undefined;
    const payload = buildPayload(isPublish ? "PUBLISHED" : "DRAFT");

    try {
      if (isPublish) {
        const res = await saveAndPublishArticleAction(payload, targetId);
        if (res.success && res.article) {
          setArticleId(res.article.id);
          setIsDirty(false);
          setSaveStatus("saved");
          setLastSavedTime(new Date());
          router.push("/admin/articles");
          return true;
        } else {
          setSaveStatus("error");
          setSaveError(res.error || "Failed to publish article.");
          return false;
        }
      } else {
        const res = await saveArticleDraftAction(payload, targetId);
        if (res.success && res.article) {
          setArticleId(res.article.id);
          setIsDirty(false);
          setSaveStatus("saved");
          const now = new Date();
          setLastSavedTime(now);

          // Update browser URL seamlessly if this was a brand new article
          if (!s.articleId && typeof window !== "undefined") {
            window.history.replaceState(null, "", `/admin/articles/${res.article.id}/edit`);
          }
          return true;
        } else {
          setSaveStatus("error");
          setSaveError(res.error || "Failed to save draft.");
          return false;
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Save failed.");
      return false;
    } finally {
      isSavingRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        performSave(false, false);
      }
    }
  };

  // Debounced auto-save trigger on user change
  const triggerChange = () => {
    setIsDirty(true);
    setSaveStatus("unsaved");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performSave(false, false);
    }, 2500);
  };

  // Update "Saved X seconds/minutes ago" interval
  useEffect(() => {
    if (!lastSavedTime) return;

    const updateLabel = () => {
      const diffMs = Date.now() - lastSavedTime.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 5) {
        setTimeAgoText("just now");
      } else if (diffSec < 60) {
        setTimeAgoText(`${diffSec}s ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        setTimeAgoText(`${diffMin}m ago`);
      }
    };

    updateLabel();
    const interval = setInterval(updateLabel, 5000);
    return () => clearInterval(interval);
  }, [lastSavedTime]);

  // Browser refresh/close protection (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Clean up auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleInsertText = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContentMarkdown((prev) => `${prev}\n\n${snippet}\n\n`);
      triggerChange();
      return;
    }

    const start = textarea.selectionStart ?? contentMarkdown.length;
    const end = textarea.selectionEnd ?? contentMarkdown.length;
    const before = contentMarkdown.slice(0, start);
    const after = contentMarkdown.slice(end);

    const newContent = `${before}${snippet}${after}`;
    setContentMarkdown(newContent);
    triggerChange();

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
    triggerChange();
  };

  const handleAddSource = () => {
    setSources((prev) => [...prev, { title: "", url: "" }]);
    triggerChange();
  };

  const handleUpdateSource = (index: number, field: "title" | "url", value: string) => {
    setSources((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    triggerChange();
  };

  const handleRemoveSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
    triggerChange();
  };

  const handleManualSaveDraft = async () => {
    setSubmitting(true);
    await performSave(true, false);
    setSubmitting(false);
  };

  const handleManualPublish = async () => {
    if (!title.trim() || !slug.trim() || !contentMarkdown.trim()) {
      alert("Please enter a Title, URL Slug, and Article Body before publishing.");
      return;
    }
    setSubmitting(true);
    await performSave(true, true);
    setSubmitting(false);
  };

  // Intercept navigation if dirty
  const handleNavAttempt = (targetUrl: string, e: React.MouseEvent) => {
    if (isDirty) {
      e.preventDefault();
      setPendingNavUrl(targetUrl);
      setShowNavModal(true);
    }
  };

  const handleModalSaveAndLeave = async () => {
    await performSave(true, false);
    setShowNavModal(false);
    if (pendingNavUrl) {
      router.push(pendingNavUrl);
    }
  };

  const handleModalDiscardAndLeave = () => {
    setIsDirty(false);
    setShowNavModal(false);
    if (pendingNavUrl) {
      router.push(pendingNavUrl);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-16">
      {/* ─── Top Bar Actions ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/articles"
            onClick={(e) => handleNavAttempt("/admin/articles", e)}
            className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {articleId ? "Edit Publication" : "New Publication"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {articleId ? `Editing /${slug}` : "Draft a new financial research article."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Unobtrusive Auto-Save Status Badge */}
          <div className="flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-teal)]" />
                <span className="text-[var(--text-secondary)]">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Saved {timeAgoText}
                </span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-500">{saveError || "Save failed"}</span>
              </>
            )}
            {saveStatus === "idle" && (
              <span className="text-[var(--text-muted)]">Draft mode</span>
            )}
          </div>

          {articleId && status === "PUBLISHED" && (
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
            onClick={handleManualSaveDraft}
            disabled={submitting || saveStatus === "saving"}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] rounded-md text-xs font-semibold text-[var(--text-primary)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {canPublish && (
            <button
              type="button"
              onClick={handleManualPublish}
              disabled={submitting || saveStatus === "saving"}
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
                  triggerChange();
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
              onChange={(e) => {
                setExcerpt(e.target.value);
                triggerChange();
              }}
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
                  onChange={(e) => {
                    setContentMarkdown(e.target.value);
                    triggerChange();
                  }}
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

        {/* Right Column: Publishing, Featured Image, Tags, SEO (1 col) */}
        <div className="space-y-6">
          {/* Publication Settings */}
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
                onChange={(e) => {
                  setStatus(e.target.value as ArticleStatus);
                  triggerChange();
                }}
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
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  triggerChange();
                }}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Public Author Profile
              </label>
              <select
                value={authorId}
                onChange={(e) => {
                  setAuthorId(e.target.value);
                  triggerChange();
                }}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Date */}
            {status === "SCHEDULED" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Scheduled Publication Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    triggerChange();
                  }}
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            )}
          </div>

          {/* Featured Image Component */}
          <ImageUploader
            value={featuredImage}
            altText={featuredImageAlt}
            onChange={(url, alt) => {
              setFeaturedImage(url);
              if (alt !== undefined) setFeaturedImageAlt(alt);
              triggerChange();
            }}
            onAltTextChange={(alt) => {
              setFeaturedImageAlt(alt);
              triggerChange();
            }}
          />

          {/* Tags */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
              <span>Article Tags</span>
            </h3>
            <div className="space-y-1">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => {
                  setTagsInput(e.target.value);
                  triggerChange();
                }}
                placeholder="cagr, investing, returns, valuation"
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
              <p className="text-[10px] text-[var(--text-muted)]">
                Comma-separated tags for search discovery.
              </p>
            </div>
          </div>

          {/* SEO & Social Metadata */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              SEO & Social Metadata
            </h3>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => {
                  setMetaTitle(e.target.value);
                  triggerChange();
                }}
                placeholder={title || "Custom search title"}
                className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => {
                  setMetaDescription(e.target.value);
                  triggerChange();
                }}
                rows={3}
                placeholder={excerpt || "Search description snippet"}
                className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                Canonical URL
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => {
                  setCanonicalUrl(e.target.value);
                  triggerChange();
                }}
                placeholder="https://volumecall.in/blog/..."
                className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                OG Share Image URL
              </label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => {
                  setOgImage(e.target.value);
                  triggerChange();
                }}
                placeholder="Defaults to Featured Image"
                className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Unsaved Changes Navigation Modal ─────────────────────────────────── */}
      {showNavModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Save changes before leaving?
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              You have unsaved changes in this article. Would you like to save your draft now or discard your edits?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowNavModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalDiscardAndLeave}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleModalSaveAndLeave}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/90 rounded-lg transition-colors cursor-pointer"
              >
                Save Draft & Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleEditorForm;
