import Link from "next/link";
import { CALCULATORS_REGISTRY } from "@/lib/calculators/registry";
import { getRelatedCalculators } from "@/lib/calculators/relatedConfig";
import { CalculatorIcon } from "@/components/ui/CalculatorIcon";
import { ArrowRight } from "lucide-react";

interface RelatedCalculatorsProps {
  currentRoute?: string;
  className?: string;
}

export default function RelatedCalculators({ currentRoute = "", className = "" }: RelatedCalculatorsProps) {
  // Get curated related calculator routes for this page
  const relatedItems = getRelatedCalculators(currentRoute);

  if (relatedItems.length === 0) return null;

  // Enrich with full metadata from registry
  const cards = relatedItems
    .map((item) => CALCULATORS_REGISTRY.find((c) => c.href === item.href))
    .filter(Boolean) as typeof CALCULATORS_REGISTRY;

  if (cards.length === 0) return null;

  return (
    <section
      className={`@container my-6 sm:my-8 border-t border-[var(--border)] pt-6 sm:pt-8 ${className}`}
      aria-labelledby="related-calculators-heading"
    >
      <div className="mb-4 sm:mb-5">
        <h2
          id="related-calculators-heading"
          className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-neutral-50 tracking-tight"
        >
          Related Calculators
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Other calculators you might find useful.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 @[680px]:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card) => (
          <Link
            key={card.slug}
            href={card.href}
            className="group p-3.5 sm:p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl sm:rounded-2xl hover:border-teal-600/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 h-full"
          >
            <div className="space-y-2">
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 sm:p-2 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-lg sm:rounded-xl shrink-0 mt-0.5">
                  <CalculatorIcon slug={card.slug} size={18} strokeWidth={1.8} className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug break-words">
                  {card.name}
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 sm:line-clamp-3">
                {card.shortDescription}
              </p>
            </div>

            <div className="flex items-center text-xs font-bold text-teal-700 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform pt-1">
              <span>Try Tool</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 shrink-0" size={14} strokeWidth={1.8} aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

