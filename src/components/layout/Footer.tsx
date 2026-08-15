import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--background-secondary)] py-10 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-Column Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pb-10 border-b border-[var(--border)] text-xs">
          {/* Column 1: Markets */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Markets
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">
                  Nifty 50
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">
                  Sensex
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">
                  Bank Nifty
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">
                  Midcap
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">
                  Smallcap
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">
                  Gold Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Stocks & Research */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Stocks & Research
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link href="/stocks" className="hover:text-[var(--foreground)] transition-colors">
                  Browse Stocks
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[var(--foreground)] transition-colors">
                  Compare Stocks
                </Link>
              </li>
              <li>
                <Link href="/ipo" className="hover:text-[var(--foreground)] transition-colors">
                  IPO Dashboard
                </Link>
              </li>
              <li>
                <Link href="/calculators/dcf-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  DCF Valuation
                </Link>
              </li>
              <li>
                <Link href="/calculators/reverse-dcf-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  Reverse DCF
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Financial Calculators */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Financial Calculators
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link href="/calculators" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                  All Calculators →
                </Link>
              </li>
              <li>
                <Link href="/calculators/sip-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  SIP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/goal-sip-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  Goal SIP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/step-up-sip-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  Step-Up SIP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/swp-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  SWP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/stp-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  STP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/emi-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  EMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/cagr-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  CAGR Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/retirement-calculator" className="hover:text-[var(--foreground)] transition-colors">
                  Retirement Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[11px]">
              Company
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[var(--foreground)] transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 pb-4">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-teal-700 dark:text-teal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
            <span className="text-sm font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">
              VolumeCall
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            © {currentYear} VolumeCall. All rights reserved.
          </span>
        </div>

        {/* Regulatory / Educational Disclaimer */}
        <div className="pt-2 text-[10px] leading-relaxed text-[var(--text-muted)] max-w-4xl">
          <p>
            <span className="font-semibold text-[var(--text-secondary)]">Disclaimer:</span>{" "}
            VolumeCall provides market information, financial ratios, and calculation tools for
            informational and educational purposes only. Nothing on this website constitutes
            investment, financial, tax, or legal advice, nor does it represent a solicitation or
            recommendation to buy or sell securities. Investments are subject to market risks.
            Consult a SEBI-registered financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
