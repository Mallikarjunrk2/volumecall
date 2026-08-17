import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";

interface RelatedCalculatorsSectionProps {
  calculatorIds?: string[] | null;
}

const CALCULATOR_REGISTRY: Record<string, { title: string; category: string; description: string }> = {
  "cagr-calculator": {
    title: "CAGR Calculator",
    category: "Returns",
    description: "Calculate Compound Annual Growth Rate over multi-year investment horizons.",
  },
  "sip-calculator": {
    title: "SIP Calculator",
    category: "Investments",
    description: "Estimate wealth creation from disciplined monthly mutual fund SIPs.",
  },
  "step-up-sip-calculator": {
    title: "Step-Up SIP Calculator",
    category: "Investments",
    description: "Model annual contribution increments to achieve financial goals faster.",
  },
  "swp-calculator": {
    title: "SWP Calculator",
    category: "Cash Flow",
    description: "Calculate sustainable monthly cash flow withdrawals and corpus longevity.",
  },
  "dcf-calculator": {
    title: "DCF Valuation Calculator",
    category: "Valuation",
    description: "Estimate intrinsic equity fair value using discounted free cash flows.",
  },
  "reverse-dcf-calculator": {
    title: "Reverse DCF Calculator",
    category: "Valuation",
    description: "Uncover implied growth expectations priced into current market quotes.",
  },
  "pe-valuation-calculator": {
    title: "P/E Valuation Calculator",
    category: "Valuation",
    description: "Model multiple-based fair stock pricing and expected target multiples.",
  },
  "ev-ebitda-calculator": {
    title: "EV/EBITDA Calculator",
    category: "Valuation",
    description: "Benchmark enterprise valuation ratios across capital structures.",
  },
  "ddm-calculator": {
    title: "Dividend Discount Model (DDM)",
    category: "Valuation",
    description: "Value dividend-paying companies using Gordon growth models.",
  },
  "emi-calculator": {
    title: "EMI Loan Calculator",
    category: "Loans",
    description: "Calculate monthly installments, interest breakdowns, and amortizations.",
  },
  "fd-calculator": {
    title: "Fixed Deposit (FD) Calculator",
    category: "Fixed Income",
    description: "Determine compound maturity returns and quarterly interest payouts.",
  },
  "rd-calculator": {
    title: "Recurring Deposit (RD) Calculator",
    category: "Fixed Income",
    description: "Model monthly deposit accumulation with compounding bank rates.",
  },
  "bond-calculator": {
    title: "Bond Yield (YTM) Calculator",
    category: "Fixed Income",
    description: "Compute yield to maturity and bond pricing for fixed-coupon debt securities.",
  },
  "xirr-calculator": {
    title: "XIRR Return Calculator",
    category: "Returns",
    description: "Calculate exact annualized returns for irregular investment cash flows.",
  },
  "irr-calculator": {
    title: "IRR Calculator",
    category: "Returns",
    description: "Internal Rate of Return engine for periodic capital project cash flows.",
  },
  "absolute-return-calculator": {
    title: "Absolute Return Calculator",
    category: "Returns",
    description: "Point-to-point capital appreciation and percentage return analysis.",
  },
  "compound-interest-calculator": {
    title: "Compound Interest Calculator",
    category: "Compounding",
    description: "Visualize exponential compounding across daily, monthly, and annual frequencies.",
  },
  "inflation-calculator": {
    title: "Inflation Impact Calculator",
    category: "Planning",
    description: "Model future purchasing power erosion and required future capital.",
  },
  "retirement-calculator": {
    title: "Retirement Planning Calculator",
    category: "Planning",
    description: "Determine target retirement corpus considering inflation and life expectancy.",
  },
  "goal-sip-calculator": {
    title: "Target Goal SIP Calculator",
    category: "Planning",
    description: "Calculate monthly SIP required to achieve a specific target corpus.",
  },
  "emergency-fund-calculator": {
    title: "Emergency Fund Calculator",
    category: "Planning",
    description: "Determine recommended liquidity reserves based on monthly expense profiles.",
  },
};

export function RelatedCalculatorsSection({ calculatorIds }: RelatedCalculatorsSectionProps) {
  if (!calculatorIds || calculatorIds.length === 0) {
    return null;
  }

  const validCalculators = calculatorIds
    .map((id) => ({ id, meta: CALCULATOR_REGISTRY[id] }))
    .filter((c) => !!c.meta);

  if (validCalculators.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg">
      <div className="flex items-center space-x-2 pb-2 border-b border-[var(--border-subtle)]">
        <Calculator className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
          Related Calculators
        </h3>
      </div>

      <div className="space-y-2">
        {validCalculators.map(({ id, meta }) => (
          <Link
            key={id}
            href={`/calculators/${id}`}
            className="p-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)]/40 rounded-md transition-all group block shadow-2xs"
          >
            <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-muted)] mb-0.5">
              <span>{meta.category}</span>
              <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors line-clamp-1">
              {meta.title}
            </h4>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 line-clamp-1 leading-normal">
              {meta.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedCalculatorsSection;
