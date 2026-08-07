import React from "react";

export function SkeletonPulse() {
  return (
    <div className="animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
  );
}

export function StockPageSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-[var(--background)]">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />

      {/* Header Info Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
          <div className="h-4 w-40 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
        </div>
        <div className="space-y-2 md:text-right">
          <div className="h-8 w-40 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
          <div className="h-4 w-28 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
        </div>
      </div>

      {/* Market Summary Table Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 py-5 border-t border-b border-[var(--border)]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 w-16 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
            <div className="h-5 w-24 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-[460px] border border-[var(--border)] rounded-md p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
          <div className="h-6 w-48 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
        </div>
        <div className="h-72 w-full animate-pulse bg-neutral-50 dark:bg-neutral-900/10 rounded-md" />
        <div className="h-4 w-full animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
      </div>

      {/* Grid of Ratios & Returns Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Ratios Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-4 w-40 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
          <div className="border border-[var(--border)] rounded-md p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-[var(--border)] last:border-b-0">
                <div className="h-4 w-36 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
                <div className="h-4 w-20 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Returns Table Skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-40 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
          <div className="h-[250px] border border-[var(--border)] rounded-md p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="h-3.5 w-16 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
                <div className="h-3.5 w-12 animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default StockPageSkeleton;
