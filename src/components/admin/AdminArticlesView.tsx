"use client";

import { useState } from "react";
import { Article, CmsUser } from "@/lib/cms/types";
import { deleteArticleAction } from "@/lib/cms/actions";
import Link from "next/link";
import { PlusCircle, Edit3, Eye, Trash2, FileText, Loader2, AlertTriangle, Search } from "lucide-react";

interface Props {
  initialArticles: Article[];
  initialStatus: string;
  currentUser?: CmsUser | null;
}

export function AdminArticlesView({ initialArticles, initialStatus, currentUser }: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || "ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteArticle, setConfirmDeleteArticle] = useState<Article | null>(null);

  const filterTabs = [
    { label: "All Articles", value: "ALL" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Drafts", value: "DRAFT" },
    { label: "In Review", value: "REVIEW" },
    { label: "Scheduled", value: "SCHEDULED" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "DRAFT":
        return "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20";
      case "REVIEW":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "SCHEDULED":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-600 border-neutral-500/20";
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      a.title.toLowerCase().includes(query) ||
      a.slug.toLowerCase().includes(query) ||
      (a.category_name && a.category_name.toLowerCase().includes(query)) ||
      (a.author_name && a.author_name.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteArticle) return;
    const id = confirmDeleteArticle.id;
    setDeletingId(id);

    try {
      await deleteArticleAction(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setConfirmDeleteArticle(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete article.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Articles Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Create, edit, schedule, and publish research articles.
          </p>
        </div>
        <div>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#2DD4BF] dark:hover:bg-[#20D6C2] text-white dark:text-black font-semibold text-xs rounded-md shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* ─── Search & Filter Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                type="button"
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[var(--text-primary)] text-[var(--bg-base)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Instant Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
          />
        </div>
      </div>

      {/* ─── Articles Table ───────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
            <p className="text-xs text-[var(--text-secondary)]">
              No articles found matching the current filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-base)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-medium">
                <tr>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredArticles.map((article) => {
                  const isOwner =
                    !currentUser ||
                    currentUser.role === "SUPER_ADMIN" ||
                    currentUser.role === "EDITOR" ||
                    article.created_by === currentUser.id ||
                    (!!currentUser.author_id && !!article.author_id && article.author_id === currentUser.author_id);

                  const canEdit =
                    !currentUser ||
                    currentUser.role === "SUPER_ADMIN" ||
                    currentUser.role === "EDITOR" ||
                    isOwner;

                  const canDelete =
                    !currentUser ||
                    currentUser.role === "SUPER_ADMIN" ||
                    currentUser.role === "EDITOR" ||
                    (isOwner && (article.status === "DRAFT" || !article.status));

                  return (
                    <tr key={article.id} className="hover:bg-[var(--bg-base)] transition-colors">
                      <td className="py-3 px-4 min-w-[240px]">
                        {canEdit ? (
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-teal)] transition-colors line-clamp-1"
                          >
                            {article.title}
                          </Link>
                        ) : (
                          <span className="font-semibold text-[var(--text-primary)] line-clamp-1">
                            {article.title}
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          /{article.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                        {article.category_name || "—"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                        {article.author_name || "—"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                            article.status
                          )}`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[var(--text-muted)]">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          {canEdit && (
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                              title="Edit Article"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {article.status === "PUBLISHED" && (
                            <Link
                              href={`/blog/${article.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                              title="Public View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteArticle(article)}
                              disabled={deletingId === article.id}
                              className="p-1.5 rounded-md hover:bg-red-500/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete Article"
                            >
                              {deletingId === article.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : !canEdit ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                              Read only
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Delete Confirmation Modal ────────────────────────────────────── */}
      {confirmDeleteArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Delete Article?
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[var(--text-primary)]">&ldquo;{confirmDeleteArticle.title}&rdquo;</strong>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setConfirmDeleteArticle(null)}
                className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deletingId === confirmDeleteArticle.id}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deletingId === confirmDeleteArticle.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminArticlesView;
