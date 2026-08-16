import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchAutocomplete from "@/components/stocks/SearchAutocomplete";
import { CalculatorIcon } from "@/components/ui/CalculatorIcon";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "VolumeCall | Indian Stock Research & Valuation Terminal",
  description:
    "Fundamentals, valuations, and price history for every NSE and BSE listed company no ads, no tips, no chatter.",
};

export default function Home() {
  const popularStocks = [
    { symbol: "RELIANCE" },
    { symbol: "TCS" },
    { symbol: "HDFCBANK" },
    { symbol: "INFY" },
    { symbol: "BHARTIARTL" },
  ];

  const capabilities = [
    {
      num: "01 / RESEARCH",
      title: "Fundamental Research",
      desc: "Study company fundamentals, financial statements, valuations, and historical price performance.",
      href: "/stocks",
    },
    {
      num: "02 / COMPARE",
      title: "Side-by-Side Comparison",
      desc: "Put companies side by side and understand how they differ across key financial metrics.",
      href: "/compare",
    },
    {
      num: "03 / DISCOVER",
      title: "Primary Market & Tools",
      desc: "Explore IPOs, market data, and research tools built for Indian equities.",
      href: "/ipo",
    },
  ];

  const workflowColumns = [
    {
      num: "01 / FUNDAMENTALS",
      title: "Fundamentals",
      items: [
        "Financial statements",
        "ROE / ROCE",
        "Margins",
        "Debt",
        "Cash flow",
      ],
    },
    {
      num: "02 / VALUATION",
      title: "Valuation",
      items: [
        "P/E",
        "P/B",
        "EV / EBITDA",
        "DCF",
        "DDM",
      ],
    },
    {
      num: "03 / PERFORMANCE",
      title: "Performance",
      items: [
        "Historical prices",
        "Returns",
        "CAGR",
        "Price trends",
        "Long-term performance",
      ],
    },
  ];

  const featuredCalculators = [
    {
      slug: "sip-calculator",
      name: "SIP",
      desc: "Calculate expected maturity wealth and interest on monthly mutual fund SIPs.",
    },
    {
      slug: "goal-sip-calculator",
      name: "Goal SIP",
      desc: "Determine exact monthly SIP needed to reach a specific financial target corpus.",
    },
    {
      slug: "step-up-sip-calculator",
      name: "Step-Up SIP",
      desc: "Model annual contribution increments to compound wealth significantly faster.",
    },
    {
      slug: "swp-calculator",
      name: "SWP",
      desc: "Simulate systematic monthly cash withdrawals and remaining corpus lifespan.",
    },
    {
      slug: "fd-calculator",
      name: "FD",
      desc: "Calculate Fixed Deposit maturity returns with standard quarterly compounding.",
    },
    {
      slug: "emi-calculator",
      name: "EMI",
      desc: "Calculate monthly loan installments and full interest amortization schedule.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased">
      <Header />

      <main className="flex-1 w-full flex flex-col">
        {/* ─── 1. HERO SECTION ─────────────────────────────────────────────── */}
        <section className="w-full bg-[var(--bg-base)] pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-7">
            {/* Top terminal label */}
            <div className="inline-block">
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#0D9488] dark:text-[#2DD4BF] font-semibold">
                INDIAN EQUITY RESEARCH TERMINAL
              </span>
            </div>

            {/* Large confident headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.08] max-w-4xl mx-auto">
              Research Indian stocks <br className="hidden sm:inline" />
              without the noise.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-[700px] mx-auto leading-relaxed font-normal">
              Fundamentals, valuations, and price history for every NSE and BSE listed company no ads, no tips, no chatter.
            </p>

            {/* Primary Stock Search Field */}
            <div className="w-full max-w-[640px] mx-auto pt-2 space-y-3.5">
              <SearchAutocomplete
                size="large"
                placeholder="Search companies, symbols (e.g. RELIANCE, TCS, HDFCBANK)..."
              />

              {/* Popular quick shortcuts */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 text-xs">
                <span className="text-[var(--text-muted)] text-[11px] font-mono">Popular:</span>
                {popularStocks.map((stock) => (
                  <Link
                    key={stock.symbol}
                    href={`/stocks/${stock.symbol.toLowerCase()}`}
                    className="px-2 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:text-[#0D9488] dark:hover:text-[#2DD4BF] rounded-xs text-xs font-mono text-[var(--text-secondary)] transition-colors"
                  >
                    {stock.symbol}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. CAPABILITIES SECTION ────────────────────────────────────── */}
        <section className="w-full bg-[var(--bg-base)] py-14 sm:py-18 lg:py-22 border-t border-[var(--border-subtle)]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
            {/* Centered Section Introduction */}
            <div className="text-center max-w-[720px] mx-auto space-y-3">
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#0D9488] dark:text-[#2DD4BF] font-semibold block">
                CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                What you can do with VolumeCall
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-[620px] mx-auto">
                Research companies, compare fundamentals, and study valuations and long-term performance.
              </p>
            </div>

            {/* Exactly THREE Feature Cards (Unified grid width, internally left-aligned) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {capabilities.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#0A0A0A] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-xs p-7 sm:p-8 space-y-5 flex flex-col justify-between transition-colors group text-left shadow-xs dark:shadow-none"
                >
                  <div className="space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                      {item.num}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <Link
                    href={item.href}
                    className="inline-flex items-center text-xs font-medium text-[#0D9488] dark:text-[#2DD4BF] hover:text-[#0F766E] dark:hover:text-[#5EEAD4] space-x-1.5 pt-1 transition-colors"
                  >
                    <span>Explore</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3. RESEARCH WORKFLOW: FROM DATA TO DECISION ─────────────────── */}
        <section className="w-full bg-[var(--bg-surface)] py-14 sm:py-18 lg:py-22 border-t border-[var(--border-subtle)]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
            {/* Centered Section Introduction */}
            <div className="text-center max-w-[720px] mx-auto space-y-3">
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#0D9488] dark:text-[#2DD4BF] font-semibold block">
                RESEARCH WORKFLOW
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                From data to decision
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-[620px] mx-auto">
                Go beyond price charts with the financial data and analysis needed to understand a company.
              </p>
            </div>

            {/* ONE Horizontal Bordered Box (Unified 1240px width, white in light mode, internally left-aligned) */}
            <div className="bg-white dark:bg-[#0A0A0A] border border-[var(--border-subtle)] rounded-xs p-7 sm:p-9 text-left shadow-xs dark:shadow-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
                {workflowColumns.map((col, idx) => (
                  <div key={idx} className={`space-y-4 ${idx > 0 ? "pt-5 md:pt-0 md:pl-8" : ""}`}>
                    <div className="space-y-1">
                      <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                        {col.num}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                        {col.title}
                      </h3>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center space-x-2">
                          <span className="h-1 w-1 rounded-full bg-[var(--text-muted)] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. FEATURED CALCULATORS ────────────────────────────────────── */}
        <section className="w-full bg-[var(--bg-base)] py-14 sm:py-18 lg:py-22 border-t border-[var(--border-subtle)]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
            {/* Centered Section Introduction */}
            <div className="text-center max-w-[720px] mx-auto space-y-3">
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#0D9488] dark:text-[#2DD4BF] font-semibold block">
                FINANCIAL PLANNING
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Financial & investment calculators
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-[620px] mx-auto">
                Mathematically verified calculators to plan SIPs, loans, retirement, and fixed-income investments in India.
              </p>
            </div>

            {/* 6 Clean Calculator Cards (Unified 1240px width, white in light mode, internally left-aligned) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCalculators.map((calc) => (
                <Link
                  key={calc.slug}
                  href={`/calculators/${calc.slug}`}
                  className="p-6 bg-white dark:bg-[#0A0A0A] hover:bg-[var(--bg-surface)] dark:hover:bg-[#0F0F0F] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-xs transition-all flex flex-col justify-between space-y-4 group text-left shadow-xs dark:shadow-none"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-xs bg-[var(--accent-teal-subtle)] dark:bg-[var(--bg-base)] border border-[var(--accent-teal-border)] dark:border-[var(--border-subtle)] text-[#0D9488] dark:text-[#2DD4BF] shrink-0">
                        <CalculatorIcon slug={calc.slug} size={15} strokeWidth={1.8} className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[#0D9488] dark:group-hover:text-[#2DD4BF] transition-colors">
                        {calc.name} Calculator
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
                      {calc.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-medium text-[#0D9488] dark:text-[#2DD4BF] group-hover:translate-x-1 transition-transform pt-0.5">
                    <span>Calculate now</span>
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Centered View All Action */}
            <div className="text-center pt-2">
              <Link
                href="/calculators"
                className="text-xs sm:text-sm font-semibold text-[#0D9488] dark:text-[#2DD4BF] hover:underline inline-flex items-center space-x-1.5"
              >
                <span>View all 27 calculators</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 5. FINAL CALL TO ACTION ────────────────────────────────────── */}
        <section className="w-full bg-[var(--bg-surface)] py-16 sm:py-20 lg:py-24 border-t border-[var(--border-subtle)]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-[640px] mx-auto space-y-6">
              <div className="space-y-3">
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#0D9488] dark:text-[#2DD4BF] font-semibold">
                  GET STARTED
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                  Start researching your first stock
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                  Search any NSE or BSE listed company to see its charts, ratios, and return history.
                </p>
              </div>

              {/* ONE Prominent Teal Button */}
              <div className="pt-1">
                <Link
                  href="/stocks"
                  className="px-8 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#5EEAD4] dark:text-black font-semibold text-sm rounded-xs transition-colors inline-flex items-center space-x-2 shadow-xs dark:shadow-none"
                >
                  <span>Search stocks</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}






