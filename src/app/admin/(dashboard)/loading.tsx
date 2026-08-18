export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-[var(--border-subtle)]/70 animate-pulse" />
          <div className="h-3.5 w-72 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
        </div>
        <div className="h-8 w-32 rounded-md bg-[var(--border-subtle)]/60 animate-pulse shrink-0" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg space-y-2"
          >
            <div className="h-3 w-20 rounded bg-[var(--border-subtle)]/50 animate-pulse" />
            <div className="h-7 w-14 rounded bg-[var(--border-subtle)]/70 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Table / Container Skeleton */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="h-4 w-36 rounded bg-[var(--border-subtle)]/60 animate-pulse" />
          <div className="h-3 w-20 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-16 rounded-full bg-[var(--border-subtle)]/50 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-[var(--border-subtle)]/40 animate-pulse" />
                </div>
                <div className="h-4 w-3/4 max-w-[360px] rounded bg-[var(--border-subtle)]/60 animate-pulse" />
              </div>
              <div className="h-7 w-20 rounded border border-[var(--border-subtle)] bg-[var(--border-subtle)]/30 animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
