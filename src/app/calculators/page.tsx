import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CalculatorIcon } from "@/components/ui/CalculatorIcon";
import {
  TrendingUp,
  Landmark,
  CreditCard,
  Percent,
  ShieldCheck,
  LineChart,
  ArrowUpRight,
  Calculator,
  type LucideIcon,
} from "lucide-react";

interface CalcItem {
  slug: string;
  name: string;
  href: string;
  description: string;
  badge?: string;
}

interface CategoryGroup {
  category: string;
  description: string;
  icon: LucideIcon;
  items: CalcItem[];
}

const calculatorCategories: CategoryGroup[] = [
  {
    category: "Systematic Investing & Wealth Planning",
    description: "Plan monthly SIPs, financial targets, annual step-ups, and systematic withdrawals.",
    icon: TrendingUp,
    items: [
      {
        slug: "sip-calculator",
        name: "SIP Calculator",
        href: "/calculators/sip-calculator",
        description: "Calculate expected maturity wealth and interest on monthly mutual fund SIP investments.",
        badge: "Popular",
      },
      {
        slug: "goal-sip-calculator",
        name: "Goal SIP Calculator",
        href: "/calculators/goal-sip-calculator",
        description: "Calculate the exact monthly SIP needed to achieve your target financial goal corpus.",
      },
      {
        slug: "step-up-sip-calculator",
        name: "Step-Up SIP Calculator",
        href: "/calculators/step-up-sip-calculator",
        description: "Calculate the exponential wealth multiplier of boosting your SIP by a fixed percentage each year.",
      },
      {
        slug: "swp-calculator",
        name: "SWP Calculator",
        href: "/calculators/swp-calculator",
        description: "Simulate monthly regular income withdrawals and remaining corpus lifespan from mutual funds.",
      },
      {
        slug: "stp-calculator",
        name: "STP Calculator",
        href: "/calculators/stp-calculator",
        description: "Simulate systematic transfers from liquid/debt funds to equity mutual funds for rupee cost averaging.",
      },
    ],
  },
  {
    category: "Fixed Income & Banking",
    description: "Calculate guaranteed returns on bank deposits, post office schemes, and coupon bonds.",
    icon: Landmark,
    items: [
      {
        slug: "fd-calculator",
        name: "FD Calculator",
        href: "/calculators/fd-calculator",
        description: "Calculate fixed deposit maturity amount, total interest earned, and quarterly compounding.",
      },
      {
        slug: "rd-calculator",
        name: "RD Calculator",
        href: "/calculators/rd-calculator",
        description: "Calculate recurring deposit maturity values using standard RBI quarterly compounding formulas.",
      },
      {
        slug: "bond-calculator",
        name: "Bond Calculator",
        href: "/calculators/bond-calculator",
        description: "Calculate clean price, dirty price, accrued interest, and Yield to Maturity (YTM) on fixed-income bonds.",
      },
    ],
  },
  {
    category: "Loans & Debt Acceleration",
    description: "Calculate monthly loan EMIs, full amortization schedules, and prepayment interest savings.",
    icon: CreditCard,
    items: [
      {
        slug: "emi-calculator",
        name: "EMI Calculator",
        href: "/calculators/emi-calculator",
        description: "Calculate monthly EMI and total interest payable for home, car, and personal loans.",
        badge: "Popular",
      },
      {
        slug: "loan-amortization-calculator",
        name: "Loan Amortization Calculator",
        href: "/calculators/loan-amortization-calculator",
        description: "Generate complete month-by-month and yearly loan principal vs interest payment schedules.",
      },
      {
        slug: "loan-prepayment-calculator",
        name: "Loan Prepayment Calculator",
        href: "/calculators/loan-prepayment-calculator",
        description: "Calculate interest savings and tenure reduction when making part-prepayments on your loan.",
      },
    ],
  },
  {
    category: "Returns & Performance Metrics",
    description: "Analyze standardized investment returns, IRR, XIRR, and time-weighted strategy growth.",
    icon: Percent,
    items: [
      {
        slug: "cagr-calculator",
        name: "CAGR Calculator",
        href: "/calculators/cagr-calculator",
        description: "Calculate Compound Annual Growth Rate for lump-sum investments in stocks, mutual funds, and assets.",
        badge: "Core",
      },
      {
        slug: "absolute-return-calculator",
        name: "Absolute Return Calculator",
        href: "/calculators/absolute-return-calculator",
        description: "Calculate point-to-point percentage capital gain and multiple of money on trades.",
      },
      {
        slug: "irr-calculator",
        name: "IRR Calculator",
        href: "/calculators/irr-calculator",
        description: "Calculate Internal Rate of Return and Net Present Value for regular-period investment projects.",
      },
      {
        slug: "xirr-calculator",
        name: "XIRR Calculator",
        href: "/calculators/xirr-calculator",
        description: "Calculate exact annualized return for irregular cash flow dates and mutual fund SIP portfolios.",
      },
      {
        slug: "time-weighted-return-calculator",
        name: "Time-Weighted Return Calculator",
        href: "/calculators/time-weighted-return-calculator",
        description: "Evaluate investment strategy performance across sub-periods, neutralizing cash deposit timing.",
      },
    ],
  },
  {
    category: "Personal Financial Planning & Compounding",
    description: "Protect against inflation, plan retirement, calculate emergency funds, and compound wealth.",
    icon: ShieldCheck,
    items: [
      {
        slug: "inflation-calculator",
        name: "Inflation Calculator",
        href: "/calculators/inflation-calculator",
        description: "Calculate future inflated cost of living, purchasing power erosion, and Fisher real returns.",
      },
      {
        slug: "retirement-calculator",
        name: "Retirement Calculator",
        href: "/calculators/retirement-calculator",
        description: "Calculate total retirement corpus required and monthly SIP needed for a comfortable retirement.",
        badge: "Essential",
      },
      {
        slug: "emergency-fund-calculator",
        name: "Emergency Fund Calculator",
        href: "/calculators/emergency-fund-calculator",
        description: "Calculate how many months of liquid safety net savings you need to protect against crises.",
      },
      {
        slug: "compound-interest-calculator",
        name: "Compound Interest Calculator",
        href: "/calculators/compound-interest-calculator",
        description: "Calculate exponential wealth compounding and effective annual rates with daily to annual frequencies.",
      },
      {
        slug: "future-value-calculator",
        name: "Future Value Calculator",
        href: "/calculators/future-value-calculator",
        description: "Calculate the future worth of any initial lump sum based on compounding growth rates.",
      },
      {
        slug: "present-value-calculator",
        name: "Present Value Calculator",
        href: "/calculators/present-value-calculator",
        description: "Calculate the initial capital required today to reach a target future financial goal.",
      },
    ],
  },
  {
    category: "Stock Valuation & Fundamental Analysis",
    description: "Value companies using Discounted Cash Flow, Reverse DCF, P/E multiples, and DDM models.",
    icon: LineChart,
    items: [
      {
        slug: "dcf-calculator",
        name: "DCF Calculator",
        href: "/calculators/dcf-calculator",
        description: "Calculate intrinsic equity value and fair share price using multi-year Free Cash Flow projections.",
      },
      {
        slug: "reverse-dcf-calculator",
        name: "Reverse DCF Calculator",
        href: "/calculators/reverse-dcf-calculator",
        description: "Reverse-engineer stock prices to find the market's implied 5-year FCF growth expectations.",
      },
      {
        slug: "pe-valuation-calculator",
        name: "P/E Valuation Calculator",
        href: "/calculators/pe-valuation-calculator",
        description: "Calculate target fair stock prices, implied multiples, and PEG ratios based on forward EPS.",
      },
      {
        slug: "ev-ebitda-calculator",
        name: "EV/EBITDA Calculator",
        href: "/calculators/ev-ebitda-calculator",
        description: "Determine Enterprise Value, Equity Value, and fair share price using EBITDA multiples.",
      },
      {
        slug: "ddm-calculator",
        name: "DDM Calculator",
        href: "/calculators/ddm-calculator",
        description: "Estimate fair stock prices for dividend-paying companies using the Gordon Growth Model.",
      },
    ],
  },
];

export default function CalculatorsHubPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Breadcrumb */}
        <div className="text-xs text-[var(--text-secondary)] mb-3 flex items-center space-x-1.5 font-normal">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium">Calculators</span>
        </div>

        {/* Centered Page Hero */}
        <div className="text-center max-w-2xl sm:max-w-3xl mx-auto pt-2 pb-8 sm:pt-4 sm:pb-10">
          <div className="inline-flex items-center justify-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-2">
            <Calculator className="h-3.5 w-3.5" size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>VolumeCall Financial Suite</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            Financial & Investment Calculators
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 max-w-xl mx-auto leading-relaxed">
            Free, mathematically verified financial calculators to help you plan SIPs, loans, retirement, fixed-income investments, and stock valuations in India.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-10 mb-16 border-t border-[var(--calc-border)] pt-8 sm:pt-10">
          {calculatorCategories.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div key={idx} className="space-y-4">
                <div className="flex items-center space-x-3 pb-2.5 border-b border-[var(--calc-border)]">
                  <div className="p-2 bg-[var(--calc-panel-bg)] text-[var(--calc-accent)] rounded-lg border border-[var(--calc-border)] shrink-0">
                    <Icon className="h-4.5 w-4.5" size={18} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                      {group.category}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((calc, cIdx) => (
                    <Link
                      key={cIdx}
                      href={calc.href}
                      className="group p-5 bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl hover:border-[var(--calc-accent)] transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-[var(--calc-panel-bg)] text-[var(--calc-accent)] rounded-md border border-[var(--calc-border)] shrink-0">
                              <CalculatorIcon slug={calc.slug} size={16} strokeWidth={1.8} className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-bold text-[var(--calc-text-primary)] group-hover:text-[var(--calc-accent)] transition-colors">
                              {calc.name}
                            </h3>
                          </div>
                          {calc.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-[var(--calc-panel-bg)] text-[var(--calc-accent)] border border-[var(--calc-border)] rounded-full shrink-0">
                              {calc.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--calc-text-secondary)] leading-relaxed line-clamp-2">
                          {calc.description}
                        </p>
                      </div>

                      <div className="flex items-center text-xs font-semibold text-[var(--calc-accent)] pt-2.5 border-t border-[var(--calc-border)] group-hover:translate-x-0.5 transition-transform">
                        <span>Calculate Now</span>
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" size={14} strokeWidth={1.8} aria-hidden="true" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
