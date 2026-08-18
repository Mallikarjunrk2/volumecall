import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPublicArticles, getCategories } from "@/lib/cms/service";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Stock Analysis & Investing Guides | VolumeCall",
  description:
    "Simple guides to understand stocks, financial concepts, valuation, and investing tools for Indian investors.",
  alternates: {
    canonical: "https://volumecall.in/blog",
  },
  openGraph: {
    title: "Stock Analysis & Investing Guides | VolumeCall",
    description:
      "Simple guides to understand stocks, financial concepts, valuation, and investing tools for Indian investors.",
    url: "https://volumecall.in/blog",
    type: "website",
    siteName: "VolumeCall",
  },
};

export const revalidate = 3600; // 1 hour background ISR fallback (invalidated on-demand via revalidatePath)

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogIndexPage(props: Props) {
  const searchParams = await props.searchParams;
  const categoryFilter = searchParams?.category || "ALL";

  const [allArticles, categories] = await Promise.all([
    getPublicArticles(),
    getCategories(),
  ]);

  const filteredArticles =
    categoryFilter === "ALL"
      ? allArticles
      : allArticles.filter((a) => a.category_slug === categoryFilter);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
        {/* ─── Hero Header ─────────────────────────────────────────────────── */}
        <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 sm:py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/20 text-xs font-mono font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>VolumeCall Learn</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-[800px] mx-auto">
              Stock Analysis & Investing Guides
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-[640px] mx-auto leading-relaxed">
              Simple guides to understand stocks, financial concepts, valuation, and investing tools for Indian investors.
            </p>
          </div>
        </section>

        {/* ─── Main Content Section ────────────────────────────────────────── */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Category Filter Tabs */}
          {categories.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)]">
              <Link
                href="/blog"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "ALL"
                    ? "bg-[var(--text-primary)] text-[var(--bg-base)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                }`}
              >
                All Articles
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === cat.slug
                      ? "bg-[var(--text-primary)] text-[var(--bg-base)]"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-8">
              <p className="text-sm text-[var(--text-secondary)]">
                No articles published in this category yet. Please check back soon.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center space-x-1.5 text-xs text-[var(--accent-teal)] hover:underline font-semibold"
              >
                <span>View all articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden hover:border-[var(--accent-teal)]/40 transition-all shadow-xs"
                >
                  {/* Thumbnail */}
                  {article.featured_image ? (
                    <Link
                      href={`/blog/${article.slug}`}
                      className="block aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-b border-[var(--border-subtle)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.featured_image}
                        alt={article.featured_image_alt || article.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>
                  ) : (
                    <Link
                      href={`/blog/${article.slug}`}
                      className="block aspect-video w-full bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]"
                    >
                      <BookOpen className="w-8 h-8 opacity-30" />
                    </Link>
                  )}

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Category & Date */}
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        {article.category_name && (
                          <span className="font-semibold text-[var(--accent-teal)] text-[11px]">
                            {article.category_name}
                          </span>
                        )}
                        {article.published_at && (
                          <span className="font-mono text-[11px] flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(article.published_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <Link href={`/blog/${article.slug}`}>
                        <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Footer / Author */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                      <div className="flex items-center space-x-1.5 font-medium truncate">
                        <User className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                        <span className="truncate">{article.author_name || "VolumeCall"}</span>
                      </div>
                      <Link
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center space-x-1 text-[var(--accent-teal)] font-semibold hover:underline shrink-0"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
