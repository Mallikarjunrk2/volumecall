import { getAdminDashboardStats, getAdminArticles } from "@/lib/cms/service";
import Link from "next/link";
import { PlusCircle, FileText, CheckCircle2, Clock, Eye, Edit3, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentArticles] = await Promise.all([
    getAdminDashboardStats(),
    getAdminArticles(),
  ]);

  const recentFive = recentArticles.slice(0, 5);

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

  return (
    <div className="space-y-8">
      {/* ─── Header & Primary Action ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Content Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Manage equity research publications, market analysis drafts, and SEO articles.
          </p>
        </div>
        <div>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#2DD4BF] dark:hover:bg-[#20D6C2] text-white dark:text-black font-semibold text-xs rounded-md shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Article</span>
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Total Articles</span>
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {stats.totalArticles}
          </p>
        </div>

        {/* Published */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.publishedArticles}
          </p>
        </div>

        {/* Drafts */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Drafts</span>
            <Edit3 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {stats.draftArticles}
          </p>
        </div>

        {/* Review / Scheduled */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>In Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {stats.reviewArticles}
          </p>
        </div>
      </div>

      {/* ─── Recent Articles List ─────────────────────────────────────────── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Recent Publications & Drafts
          </h2>
          <Link
            href="/admin/articles"
            className="inline-flex items-center space-x-1 text-xs text-[var(--accent-teal)] hover:underline font-medium"
          >
            <span>View all articles</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentFive.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-[var(--text-secondary)]">
              No articles created yet. Get started by drafting your first publication.
            </p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-xs font-semibold rounded-md text-[var(--text-primary)] transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Article</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {recentFive.map((article) => (
              <div
                key={article.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[var(--bg-base)] transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                        article.status
                      )}`}
                    >
                      {article.status}
                    </span>
                    {article.category_name && (
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">
                        {article.category_name}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="block text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-teal)] truncate transition-colors"
                  >
                    {article.title}
                  </Link>
                </div>

                <div className="flex items-center space-x-3 shrink-0 text-xs">
                  <span className="text-[var(--text-muted)] text-[11px] font-mono">
                    {new Date(article.updated_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Edit Article"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Link>
                  {article.status === "PUBLISHED" && (
                    <Link
                      href={`/blog/${article.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      title="View Public Article"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
