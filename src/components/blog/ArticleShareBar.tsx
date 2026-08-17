"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface ArticleShareBarProps {
  title: string;
  slug: string;
}

export function ArticleShareBar({ title, slug }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const articleUrl = typeof window !== "undefined"
    ? `${window.location.origin}/blog/${slug}`
    : `https://volumecall.in/blog/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center space-x-2 text-xs">
      <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center space-x-1 mr-1">
        <Share2 className="w-3 h-3" />
        <span>Share:</span>
      </span>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 text-[var(--text-muted)]" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#25D366] text-[var(--text-secondary)] hover:text-[#25D366] transition-colors"
        title="Share on WhatsApp"
      >
        WhatsApp
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Share on X"
      >
        X
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#0A66C2] text-[var(--text-secondary)] hover:text-[#0A66C2] transition-colors"
        title="Share on LinkedIn"
      >
        LinkedIn
      </a>
    </div>
  );
}

export default ArticleShareBar;
