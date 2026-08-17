import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PrevNextNavProps {
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}

export function PrevNextNav({ prev, next }: PrevNextNavProps) {
  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Previous and Next Articles"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[var(--border-subtle)] text-xs"
    >
      {/* Previous Article */}
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-teal)]/40 transition-colors group flex flex-col justify-between space-y-1 text-left"
        >
          <div className="flex items-center space-x-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] transition-colors">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            <span>Previous Article</span>
          </div>
          <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors line-clamp-2">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next Article */}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-teal)]/40 transition-colors group flex flex-col justify-between space-y-1 text-right sm:text-right"
        >
          <div className="flex items-center justify-end space-x-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] transition-colors">
            <span>Next Article</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors line-clamp-2">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}

export default PrevNextNav;
