import Link from "next/link";
import { Article } from "@/lib/cms/types";
import { BookOpen } from "lucide-react";

interface LatestArticlesSectionProps {
  articles: Article[];
  isMobileBottom?: boolean;
}

export function LatestArticlesSection({ articles, isMobileBottom = false }: LatestArticlesSectionProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  // Mobile layout at bottom of article
  if (isMobileBottom) {
    return (
      <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[var(--accent-teal)]" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
            Latest Blogs
          </h3>
        </div>

        <div className="space-y-3">
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/blog/${art.slug}`}
              className="group flex items-start gap-3 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)]/40 transition-all shadow-xs"
            >
              {/* Thumbnail 16:9 */}
              <div className="w-[96px] h-[64px] shrink-0 rounded-xs overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-[var(--border-subtle)]">
                {art.featured_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={art.featured_image}
                    alt={art.featured_image_alt || art.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-base)]">
                    <BookOpen className="w-5 h-5 opacity-30" />
                  </div>
                )}
              </div>

              {/* Title & Date */}
              <div className="min-w-0 flex-1 space-y-1">
                {art.category_name && (
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[var(--accent-teal)] block line-clamp-1">
                    {art.category_name}
                  </span>
                )}
                <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h4>
                {art.published_at && (
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">
                    {new Date(art.published_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Desktop Sidebar (No outer box container, clean horizontal cards)
  return (
    <aside className="space-y-3">
      <div className="pb-2 border-b border-[var(--border-subtle)]">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)] flex items-center space-x-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
          <span>Latest Blogs</span>
        </h3>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {articles.map((art) => (
          <Link
            key={art.id}
            href={`/blog/${art.slug}`}
            className="group flex items-start gap-3 py-3 first:pt-1 last:pb-1 transition-colors"
          >
            {/* Thumbnail: ~96px wide, ~64px high */}
            <div className="w-[96px] h-[64px] shrink-0 rounded-xs overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-[var(--border-subtle)]">
              {art.featured_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={art.featured_image}
                  alt={art.featured_image_alt || art.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-surface)]">
                  <BookOpen className="w-5 h-5 opacity-30" />
                </div>
              )}
            </div>

            {/* Title + Date */}
            <div className="min-w-0 flex-1 space-y-1">
              {art.category_name && (
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[var(--accent-teal)] block line-clamp-1">
                  {art.category_name}
                </span>
              )}
              <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors line-clamp-2 leading-snug">
                {art.title}
              </h4>
              {art.published_at && (
                <p className="text-[10px] font-mono text-[var(--text-muted)]">
                  {new Date(art.published_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export default LatestArticlesSection;
