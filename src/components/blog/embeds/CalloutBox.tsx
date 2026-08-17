import React from "react";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

interface CalloutBoxProps {
  type: "tip" | "warning";
  title?: string;
  content: string;
}

export function CalloutBox({ type, title, content }: CalloutBoxProps) {
  const isTip = type === "tip";

  const defaultTitle = isTip ? "Key Insight" : "Risk Warning";
  const effectiveTitle = title || defaultTitle;

  return (
    <aside
      className={`my-6 p-4 rounded-lg border text-xs leading-relaxed ${
        isTip
          ? "bg-[var(--accent-teal)]/5 border-[var(--accent-teal)]/30 text-[var(--text-primary)]"
          : "bg-amber-500/5 border-amber-500/30 text-[var(--text-primary)]"
      }`}
    >
      <div className="flex items-center space-x-2 font-bold mb-1.5">
        {isTip ? (
          <Lightbulb className="w-4 h-4 text-[var(--accent-teal)] shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        )}
        <span
          className={`font-semibold tracking-tight ${
            isTip ? "text-[var(--accent-teal)]" : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {effectiveTitle}
        </span>
      </div>

      <MarkdownRenderer
        content={content}
        className="[&>p]:text-xs [&>p]:mb-1 [&>p]:text-[var(--text-secondary)] [&>ul]:text-xs [&>ul]:mb-1"
      />
    </aside>
  );
}

export default CalloutBox;
