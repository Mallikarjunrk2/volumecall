import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function BlogLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
        {/* Hero Skeleton */}
        <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 sm:py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-block h-6 w-36 rounded-full bg-[var(--border-subtle)]/60 animate-pulse" />
            <div className="h-10 sm:h-12 w-3/4 max-w-[600px] mx-auto rounded-md bg-[var(--border-subtle)]/60 animate-pulse" />
            <div className="h-4 sm:h-5 w-1/2 max-w-[400px] mx-auto rounded-md bg-[var(--border-subtle)]/40 animate-pulse" />
          </div>
        </section>

        {/* Content Section Skeleton */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Category Filter Pills Skeleton */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)]">
            <div className="h-7 w-24 rounded-full bg-[var(--border-subtle)]/60 animate-pulse" />
            <div className="h-7 w-32 rounded-full bg-[var(--border-subtle)]/40 animate-pulse" />
            <div className="h-7 w-28 rounded-full bg-[var(--border-subtle)]/40 animate-pulse" />
            <div className="h-7 w-36 rounded-full bg-[var(--border-subtle)]/40 animate-pulse" />
          </div>

          {/* Articles Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden"
              >
                {/* Thumbnail Skeleton */}
                <div className="aspect-video w-full bg-[var(--border-subtle)]/40 animate-pulse" />

                {/* Card Body Skeleton */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-20 rounded bg-[var(--border-subtle)]/60 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                    </div>
                    <div className="h-5 w-5/6 rounded bg-[var(--border-subtle)]/70 animate-pulse" />
                    <div className="space-y-1.5 pt-1">
                      <div className="h-3 w-full rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                      <div className="h-3 w-4/5 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div className="h-3 w-24 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                    <div className="h-3 w-12 rounded bg-[var(--border-subtle)]/60 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
