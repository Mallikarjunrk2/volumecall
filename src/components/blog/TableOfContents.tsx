"use client";

import { useState } from "react";
import { TocHeading } from "./ArticleContentCompiler";
import { List, ChevronDown, ChevronUp } from "lucide-react";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  // Collapsed / closed by default as requested
  const [isOpen, setIsOpen] = useState(false);

  if (!headings || headings.length < 3) {
    return null;
  }

  return (
    <nav
      aria-label="Table of Contents"
      className="my-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-teal)]"
      >
        <div className="flex items-center space-x-2">
          <List className="w-4 h-4 text-[var(--accent-teal)]" />
          <span className="font-bold text-[var(--text-primary)] text-xs">
            Table of Contents
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            ({headings.length} sections)
          </span>
        </div>
        <span className="text-[var(--text-muted)]">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <ul className="px-4 pb-3.5 pt-1 space-y-1.5 border-t border-[var(--border-subtle)] font-sans">
          {headings.map((h, i) => (
            <li
              key={`${h.id}-${i}`}
              className={h.level === 3 ? "pl-4 text-[11px] text-[var(--text-secondary)]" : "text-xs font-medium text-[var(--text-primary)]"}
            >
              <a
                href={`#${h.id}`}
                className="hover:text-[var(--accent-teal)] hover:underline transition-colors block py-0.5"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default TableOfContents;
