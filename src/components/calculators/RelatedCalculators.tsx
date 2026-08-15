import Link from "next/link";
import { CALCULATORS_REGISTRY, CalculatorMeta } from "@/lib/calculators/registry";
import { CalculatorIcon } from "@/components/ui/CalculatorIcon";
import { ArrowRight } from "lucide-react";

interface RelatedCalculatorsProps {
  currentRoute?: string;
}

export default function RelatedCalculators({ currentRoute }: RelatedCalculatorsProps) {
  // Filter out current page
  const cards: CalculatorMeta[] = CALCULATORS_REGISTRY.filter((c) => c.href !== currentRoute).slice(0, 6);

  return (
    <section className="my-12 border-t border-[var(--border)] pt-10" aria-labelledby="related-calculators-heading">
      <div className="mb-6">
        <h2 id="related-calculators-heading" className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-neutral-50">
          Explore More Financial Calculators & Tools
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Explore other calculators and analytical tools to plan, invest and manage your money.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.slug}
            href={card.href}
            className="group p-5 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl hover:border-teal-600/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-xl shrink-0">
                  <CalculatorIcon slug={card.slug} size={20} strokeWidth={1.8} className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {card.name}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {card.shortDescription}
              </p>
            </div>

            <div className="flex items-center text-xs font-bold text-teal-700 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform pt-2">
              <span>Try Tool</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" size={14} strokeWidth={1.8} aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
