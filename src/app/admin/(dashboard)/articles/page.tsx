import { getAdminArticles } from "@/lib/cms/service";
import { deleteArticleAction } from "@/lib/cms/actions";
import Link from "next/link";
import { PlusCircle, Edit3, Eye, Trash2, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminArticlesPage(props: Props) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status || "ALL";
  const articles = await getAdminArticles(statusFilter);

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

      {/* ─── Filter Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value === "ALL" ? "/admin/articles" : `/admin/articles?status=${tab.value}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[var(--text-primary)] text-[var(--bg-base)]"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* ─── Articles Table ───────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        {articles.length === 0 ? (
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
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-[var(--bg-base)] transition-colors">
                    <td className="py-3 px-4 min-w-[240px]">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-teal)] transition-colors line-clamp-1"
                      >
                        {article.title}
                      </Link>
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
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
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
                        <form
                          action={async () => {
                            "use server";
                            await deleteArticleAction(article.id);
                          }}
                          className="inline"
                        >
                          <button
                            type="submit"
                            className="p-1.5 rounded-md hover:bg-red-500/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
