import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-base)] py-10 mt-auto text-xs font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 4-Column Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pb-8 border-b border-[var(--border-subtle)]">
          {/* Column 1: Markets */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-mono">
              Markets
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link href="/markets" className="hover:text-[var(--text-primary)] transition-colors">
                  Nifty 50
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--text-primary)] transition-colors">
                  Sensex
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--text-primary)] transition-colors">
                  Bank Nifty
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--text-primary)] transition-colors">
                  Midcap
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--text-primary)] transition-colors">
                  Smallcap
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-[var(--text-primary)] transition-colors">
                  Gold Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Stocks & Research */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-mono">
              Stocks & Research
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link href="/stocks" className="hover:text-[var(--text-primary)] transition-colors">
                  Browse Stocks
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[var(--text-primary)] transition-colors">
                  Compare Stocks
                </Link>
              </li>
              <li>
                <Link href="/ipo" className="hover:text-[var(--text-primary)] transition-colors">
                  IPO Dashboard
                </Link>
              </li>
              <li>
                <Link href="/calculators/dcf-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  DCF Valuation
                </Link>
              </li>
              <li>
                <Link href="/calculators/reverse-dcf-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  Reverse DCF
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Financial Calculators */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-mono">
              Financial Calculators
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link href="/calculators" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                  All Calculators →
                </Link>
              </li>
              <li>
                <Link href="/calculators/sip-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  SIP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/goal-sip-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  Goal SIP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/step-up-sip-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  Step-Up SIP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/swp-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  SWP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/stp-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  STP Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/emi-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  EMI Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/cagr-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  CAGR Calculator
                </Link>
              </li>
              <li>
                <Link href="/calculators/retirement-calculator" className="hover:text-[var(--text-primary)] transition-colors">
                  Retirement Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-mono">
              Company
            </h4>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[var(--text-primary)] transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-xs bg-teal-600 dark:bg-teal-400 flex items-center justify-center shrink-0">
              <span className="h-1 w-1 bg-white dark:bg-black rounded-xs" />
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
              VolumeCall
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            © {currentYear} VolumeCall. All rights reserved.
          </span>
        </div>

        {/* Regulatory / Educational Disclaimer */}
        <div className="pt-2 text-[10px] leading-relaxed text-[var(--text-muted)] max-w-4xl border-t border-[var(--border-subtle)]">
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

