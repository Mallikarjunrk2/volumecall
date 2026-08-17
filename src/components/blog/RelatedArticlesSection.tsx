import Link from "next/link";
import { Article } from "@/lib/cms/types";
import { BookOpen } from "lucide-react";

interface RelatedArticlesSectionProps {
  articles: Article[];
  title?: string;
  isMobile?: boolean;
}

export function RelatedArticlesSection({
  articles,
  title = "Related Posts",
  isMobile = false,
}: RelatedArticlesSectionProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  // Mobile layout rendered inline stacked below article body
  if (isMobile) {
    return (
      <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
        <div className="flex items-center space-x-2 pb-2 border-b border-[var(--border-subtle)]">
          <BookOpen className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
            {title}
          </h3>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {articles.slice(0, 4).map((art) => (
            <Link
              key={art.id}
              href={`/blog/${art.slug}`}
              className="group flex items-start gap-3 py-3 first:pt-1 last:pb-1 transition-colors"
            >
              {/* Thumbnail 16:9 on Left: 84px x 56px fixed */}
              <div className="w-[84px] h-[56px] shrink-0 rounded-xs overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-[var(--border-subtle)]">
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

              {/* Title & Meta on Right */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h4>
                {art.category_name && (
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[var(--accent-teal)] block line-clamp-1">
                    {art.category_name}
                  </span>
                )}
                {art.published_at && (
                  <p className="text-[10px] font-mono text-[var(--text-muted)] pt-0.5">
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

  // Desktop Sidebar Layout (Unboxed, natural height, sits right beside article body)
  return (
    <div className="space-y-3 w-full h-fit">
      <div className="pb-2 border-b border-[var(--border-subtle)]">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)] flex items-center space-x-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
          <span>{title}</span>
        </h3>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {articles.slice(0, 4).map((art) => (
          <Link
            key={art.id}
            href={`/blog/${art.slug}`}
            className="group flex items-start gap-3 py-3 first:pt-1 last:pb-1 transition-colors"
          >
            {/* Thumbnail: 84px wide, 56px high fixed */}
            <div className="w-[84px] h-[56px] shrink-0 rounded-xs overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-[var(--border-subtle)]">
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

            {/* Title + Category + Date */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors line-clamp-2 leading-snug">
                {art.title}
              </h4>
              {art.category_name && (
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[var(--accent-teal)] block line-clamp-1">
                  {art.category_name}
                </span>
              )}
              {art.published_at && (
                <p className="text-[10px] font-mono text-[var(--text-muted)] pt-0.5">
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
    </div>
  );
}

export default RelatedArticlesSection;
