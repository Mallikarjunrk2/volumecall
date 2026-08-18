import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ArticleLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
        <article className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb / Back Link Skeleton */}
          <div className="h-4 w-28 rounded bg-[var(--border-subtle)]/50 animate-pulse mb-6" />

          {/* Article Header Skeleton */}
          <header className="space-y-4 pb-8 border-b border-[var(--border-subtle)] max-w-4xl">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-24 rounded-full bg-[var(--border-subtle)]/60 animate-pulse" />
              <div className="h-4 w-32 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-8 sm:h-11 w-full rounded-md bg-[var(--border-subtle)]/70 animate-pulse" />
              <div className="h-8 sm:h-11 w-3/4 rounded-md bg-[var(--border-subtle)]/70 animate-pulse" />
            </div>

            {/* Excerpt Skeleton */}
            <div className="space-y-1.5 pt-2">
              <div className="h-4 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
            </div>

            {/* Author Bar Skeleton */}
            <div className="flex items-center space-x-3 pt-4 border-t border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-full bg-[var(--border-subtle)]/60 animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-[var(--border-subtle)]/60 animate-pulse" />
                <div className="h-3 w-44 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
              </div>
            </div>
          </header>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
            {/* Left Content Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Featured Image Skeleton */}
              <div className="aspect-video w-full rounded-xl bg-[var(--border-subtle)]/40 animate-pulse" />

              {/* Body Text Paragraph Skeletons */}
              <div className="space-y-4 pt-4">
                <div className="h-6 w-48 rounded bg-[var(--border-subtle)]/70 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-4 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-4 w-11/12 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-4 w-4/5 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                </div>
                <div className="h-28 w-full rounded-lg bg-[var(--border-subtle)]/30 animate-pulse my-6" />
                <div className="h-6 w-56 rounded bg-[var(--border-subtle)]/70 animate-pulse pt-2" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-4 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Right Sidebar Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Table of Contents Skeleton */}
              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                <div className="h-4 w-32 rounded bg-[var(--border-subtle)]/60 animate-pulse" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-4/5 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-3 w-3/5 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-3 w-5/6 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                </div>
              </div>

              {/* Related Articles Skeleton */}
              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                <div className="h-4 w-28 rounded bg-[var(--border-subtle)]/60 animate-pulse" />
                <div className="space-y-3 pt-2">
                  <div className="h-12 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-12 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                  <div className="h-12 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
