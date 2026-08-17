import { ArticleSource } from "@/lib/cms/types";
import { Link2, ExternalLink } from "lucide-react";

interface ArticleSourcesSectionProps {
  sources?: ArticleSource[] | null;
}

function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ArticleSourcesSection({ sources }: ArticleSourcesSectionProps) {
  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  const validSources = sources.filter((s) => s.title && s.url && isValidHttpUrl(s.url));

  if (validSources.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)] text-xs">
      <div className="flex items-center space-x-2">
        <Link2 className="w-4 h-4 text-[var(--accent-teal)]" />
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
          Sources & References
        </h3>
      </div>

      <ol className="space-y-1.5 list-decimal list-inside text-[var(--text-secondary)]">
        {validSources.map((source, index) => (
          <li key={index} className="leading-relaxed">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--accent-teal)] hover:underline inline-flex items-center space-x-1"
            >
              <span>{source.title}</span>
              <ExternalLink className="w-3 h-3 inline-block opacity-70" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default ArticleSourcesSection;
