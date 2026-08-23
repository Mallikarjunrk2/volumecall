import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  getPublicArticles,
  getPublicArticleBySlug,
  getRelatedArticles,
  getCategories,
  getPrevNextArticles,
} from "@/lib/cms/service";
import {
  ArticleContentCompiler,
  extractTocHeadings,
} from "@/components/blog/ArticleContentCompiler";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { PrevNextNav } from "@/components/blog/PrevNextNav";
import { ArticleSourcesSection } from "@/components/blog/ArticleSourcesSection";
import { ArticleDisclaimer } from "@/components/blog/ArticleDisclaimer";
import { ArticleShareBar } from "@/components/blog/ArticleShareBar";
import { Calendar, ArrowLeft, Clock, Tag, RefreshCw } from "lucide-react";

export const revalidate = 3600; // 1 hour background ISR fallback (invalidated on-demand via revalidatePath)
export const dynamicParams = true;

/**
 * Generate static params for pre-rendering all published articles at build time.
 */
export async function generateStaticParams() {
  const articles = await getPublicArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const article = await getPublicArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Article Not Found | VolumeCall",
      description: "The requested article could not be found.",
    };
  }

  const title = article.meta_title || `${article.title} | VolumeCall`;
  const description = article.meta_description || article.excerpt;
  const canonical = article.canonical_url || `https://volumecall.in/blog/${article.slug}`;
  const ogImg = article.og_image || article.featured_image || "https://volumecall.in/og.png";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "VolumeCall",
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      authors: article.author_name ? [article.author_name] : ["VolumeCall"],
      images: [
        {
          url: ogImg,
          alt: article.featured_image_alt || article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImg],
    },
  };
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const article = await getPublicArticleBySlug(params.slug);

  if (!article) {
    return notFound();
  }

  // Fetch related articles, categories, and prev/next navigation in parallel
  const [relatedArticles, categories, { prev, next }] = await Promise.all([
    getRelatedArticles(article.id, article.category_id, 4),
    getCategories(),
    getPrevNextArticles(article.published_at, article.id),
  ]);

  // Extract Table of Contents headings
  const tocHeadings = extractTocHeadings(article.content_markdown);

  // Calculate approximate reading time (avg 200 words per minute)
  const wordCount = article.content_markdown.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Determine if meaningful update occurred (> 24 hours after published)
  const publishedDate = article.published_at ? new Date(article.published_at) : new Date(article.created_at);
  const updatedDate = new Date(article.updated_at);
  const showUpdated = updatedDate.getTime() - publishedDate.getTime() > 24 * 60 * 60 * 1000;

  // JSON-LD Structured Data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.featured_image ? [article.featured_image] : undefined,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: article.author_name || "VolumeCall",
    },
    publisher: {
      "@type": "Organization",
      name: "VolumeCall",
      logo: {
        "@type": "ImageObject",
        url: "https://volumecall.in/icon-512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://volumecall.in/blog/${article.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://volumecall.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: "https://volumecall.in/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://volumecall.in/blog/${article.slug}`,
      },
    ],
  };

  return (
    <>
      <Header />
      {/* ─── Structured Data Scripts ──────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
          {/* ─── LEVEL 1: FULL ARTICLE TOP SECTION (Header, Featured Image, TOC) ─── */}
          <div className="max-w-[740px] space-y-6">
            {/* Breadcrumb & Share Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
              <div className="flex items-center space-x-2">
                <Link
                  href="/blog"
                  className="inline-flex items-center space-x-1 hover:text-[var(--text-primary)] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Articles</span>
                </Link>
                {article.category_name && (
                  <>
                    <span>/</span>
                    <Link
                      href={`/blog?category=${article.category_slug}`}
                      className="font-semibold text-[var(--accent-teal)] hover:underline"
                    >
                      {article.category_name}
                    </Link>
                  </>
                )}
              </div>

              <ArticleShareBar title={article.title} slug={article.slug} />
            </div>

            {/* Header Information */}
            <div className="space-y-4 border-b border-[var(--border-subtle)] pb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.18]">
                {article.title}
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {article.excerpt}
              </p>

              {/* Author & Publication Metadata */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
                {/* Author Display */}
                <div className="flex items-center space-x-2">
                  {article.author_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.author_avatar}
                      alt={article.author_name || "VolumeCall"}
                      className="h-6 w-6 rounded-full object-cover border border-[var(--border-subtle)]"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 flex items-center justify-center text-[var(--accent-teal)] font-bold text-[10px] shrink-0">
                      {article.author_name ? article.author_name[0] : "V"}
                    </div>
                  )}
                  <span className="font-semibold text-[var(--text-primary)] text-xs">
                    {article.author_name || "VolumeCall"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                  {article.published_at && (
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {publishedDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  )}

                  {showUpdated && (
                    <span className="flex items-center space-x-1 text-[var(--text-secondary)]">
                      <RefreshCw className="w-3 h-3" />
                      <span>
                        Updated{" "}
                        {updatedDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  )}

                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{readTime} min read</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Image (16:9 matching article body width) */}
            {article.featured_image && (
              <div className="aspect-16/9 w-full overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-neutral-100 dark:bg-neutral-900 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featured_image}
                  alt={article.featured_image_alt || article.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            )}

            {/* Table of Contents (matching article body width) */}
            <TableOfContents headings={tocHeadings} />
          </div>

          {/* ─── LEVEL 2: ARTICLE BODY + SIDEBAR ROW (STARTS AT PARAGRAPH 1) ────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,740px)_280px] gap-8 lg:gap-10 pt-2 items-start">
            {/* Left Reading Column */}
            <main className="min-w-0 w-full max-w-[740px] space-y-8">
              {/* Article Markdown Body + In-body Directive Embeds */}
              <div className="min-w-0 w-full">
                <ArticleContentCompiler
                  content={article.content_markdown}
                  articleTitle={article.title}
                />
              </div>

              {/* Article Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-[var(--border-subtle)]">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center space-x-1 mr-1">
                    <Tag className="w-3 h-3" />
                    <span>Tags:</span>
                  </span>
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Mobile-only Sidebar (< lg only) */}
              <div className="lg:hidden">
                <BlogSidebar
                  relatedArticles={relatedArticles}
                  categories={categories}
                  currentCategorySlug={article.category_slug}
                  isMobile={true}
                />
              </div>

              {/* Sources & References */}
              <ArticleSourcesSection sources={article.sources_json} />

              {/* Investment & Regulatory Disclaimer */}
              <ArticleDisclaimer />

              {/* Editorial Author Box: VolumeCall Research */}
              <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg space-y-3">
                <div className="flex items-start space-x-3.5">
                  {article.author_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.author_avatar}
                      alt={article.author_name || "VolumeCall Research"}
                      className="h-10 w-10 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 flex items-center justify-center text-[var(--accent-teal)] font-bold text-sm shrink-0">
                      {article.author_name ? article.author_name[0] : "V"}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      {article.author_name || "VolumeCall Research"}
                    </h4>
                    <p className="text-xs font-semibold text-[var(--accent-teal)]">
                      {article.author_role || "Equity Research & Quantitative Analysis"}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-0.5">
                      {article.author_bio || "Independent equity research and market analysis published by the VolumeCall editorial team."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Previous / Next Navigation */}
              <PrevNextNav prev={prev} next={next} />
            </main>

            {/* Desktop Right Discovery Sidebar (Sits directly beside paragraph 1) */}
            <aside className="hidden lg:block w-[280px] shrink-0 sticky top-20 h-fit self-start">
              <BlogSidebar
                relatedArticles={relatedArticles}
                categories={categories}
                currentCategorySlug={article.category_slug}
              />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
