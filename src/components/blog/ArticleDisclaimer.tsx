import { ShieldAlert } from "lucide-react";

export function ArticleDisclaimer() {
  return (
    <aside
      aria-label="Financial Research Disclaimer"
      className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] leading-relaxed text-[var(--text-muted)] space-y-1.5"
    >
      <div className="flex items-center space-x-1.5 font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
        <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
        <span>Investment & Regulatory Disclaimer</span>
      </div>
      <p>
        This publication is prepared strictly for educational and informational purposes only and must not be construed as investment advice, research recommendation, or solicitation to buy or sell securities. Public equities and financial instruments involve substantial market risk. Investors should conduct independent due diligence, review financial statements, and consult a SEBI-registered financial advisor before making investment decisions.
      </p>
    </aside>
  );
}

export default ArticleDisclaimer;
