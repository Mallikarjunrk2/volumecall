import Link from "next/link";
import { Article, ArticleCategory } from "@/lib/cms/types";

interface BlogSidebarProps {
  relatedArticles: Article[];
  categories: ArticleCategory[];
  currentCategorySlug?: string | null;
  isMobile?: boolean;
}

export function BlogSidebar({
  relatedArticles,
  categories,
  currentCategorySlug,
  isMobile = false,
}: BlogSidebarProps) {
  if (isMobile) {
    return (
      <div className="space-y-6 pt-6 border-t border-[var(--border-subtle)]">
        {/* Module 1: Related Blogs */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="pb-2.5 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Related Blogs
              </h3>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {relatedArticles.slice(0, 4).map((art) => (
                <Link
                  key={art.id}
                  href={`/blog/${art.slug}`}
                  className="block py-2.5 first:pt-0 last:pb-0 group"
                >
                  <h4 className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent-teal)] transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  {art.category_name && (
                    <span className="text-[10px] font-mono text-[var(--accent-teal)] mt-1 block">
                      {art.category_name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Module 2: All Blog Topics */}
        {categories && categories.length > 0 && (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="pb-2.5 border-b border-[var(--border-subtle)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                All Blog Topics
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = cat.slug === currentCategorySlug;
                return (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}`}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border-[var(--accent-teal)]/30 font-semibold"
                        : "bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]"
                    }`}
                  >
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Sidebar Layout
  return (
    <div className="space-y-5 w-[280px] h-fit">
      {/* Module 1: Related Blogs */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="pb-2.5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Related Blogs
            </h3>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {relatedArticles.slice(0, 4).map((art) => (
              <Link
                key={art.id}
                href={`/blog/${art.slug}`}
                className="block py-2.5 first:pt-0 last:pb-0 group"
              >
                <h4 className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent-teal)] transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h4>
                {art.category_name && (
                  <span className="text-[10px] font-mono text-[var(--accent-teal)] mt-1 block">
                    {art.category_name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Module 2: All Blog Topics */}
      {categories && categories.length > 0 && (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="pb-2.5 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              All Blog Topics
            </h3>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {categories.map((cat) => {
              const isSelected = cat.slug === currentCategorySlug;
              return (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`block py-2 first:pt-0 last:pb-0 text-xs transition-colors ${
                    isSelected
                      ? "text-[var(--accent-teal)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogSidebar;
