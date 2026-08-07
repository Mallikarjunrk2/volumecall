import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--background-secondary)] py-8 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-[var(--border)] pb-8 mb-8 text-xs">
          {/* Column 1: Markets */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[10px]">Markets</h4>
            <ul className="space-y-2 text-[var(--text-secondary)] font-normal">
              <li><Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">Nifty 50</Link></li>
              <li><Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">Sensex</Link></li>
              <li><Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">Bank Nifty</Link></li>
              <li><Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">Midcap</Link></li>
              <li><Link href="/markets" className="hover:text-[var(--foreground)] transition-colors">Smallcap</Link></li>
            </ul>
          </div>

          {/* Column 2: Stocks */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[10px]">Stocks</h4>
            <ul className="space-y-2 text-[var(--text-secondary)] font-normal">
              <li><Link href="/stocks" className="hover:text-[var(--foreground)] transition-colors">Browse Stocks</Link></li>
              <li><Link href="/screener" className="hover:text-[var(--foreground)] transition-colors">Screener</Link></li>
              <li><Link href="/compare" className="hover:text-[var(--foreground)] transition-colors">Compare</Link></li>
              <li><Link href="/ipo" className="hover:text-[var(--foreground)] transition-colors">IPO</Link></li>
            </ul>
          </div>

          {/* Column 3: Collections */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[10px]">Collections</h4>
            <ul className="space-y-2 text-[var(--text-secondary)] font-normal">
              <li><Link href="/collections/banking" className="hover:text-[var(--foreground)] transition-colors">Banking Stocks</Link></li>
              <li><Link href="/collections/it" className="hover:text-[var(--foreground)] transition-colors">IT Stocks</Link></li>
              <li><Link href="/collections/pharma" className="hover:text-[var(--foreground)] transition-colors">Pharma Stocks</Link></li>
              <li><Link href="/collections/auto" className="hover:text-[var(--foreground)] transition-colors">Auto Stocks</Link></li>
              <li><Link href="/collections/defence" className="hover:text-[var(--foreground)] transition-colors">Defence Stocks</Link></li>
              <li><Link href="/collections/railway" className="hover:text-[var(--foreground)] transition-colors">Railway Stocks</Link></li>
              <li><Link href="/collections/dividend" className="hover:text-[var(--foreground)] transition-colors">Dividend Stocks</Link></li>
            </ul>
          </div>

          {/* Column 4: Tools & Resources */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[10px]">Tools & Resources</h4>
            <ul className="space-y-2 text-[var(--text-secondary)] font-normal">
              <li><Link href="/tools/pe" className="hover:text-[var(--foreground)] transition-colors">PE Calculator</Link></li>
              <li><Link href="/tools/cagr" className="hover:text-[var(--foreground)] transition-colors">CAGR Calculator</Link></li>
              <li><Link href="/tools/sip" className="hover:text-[var(--foreground)] transition-colors">SIP Calculator</Link></li>
              <li><Link href="/tools/emi" className="hover:text-[var(--foreground)] transition-colors">EMI Calculator</Link></li>
              <li><Link href="/resources/learn" className="hover:text-[var(--foreground)] transition-colors">Learn Research</Link></li>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-bold text-[var(--foreground)] uppercase tracking-wider text-[10px]">Company</h4>
            <ul className="space-y-2 text-[var(--text-secondary)] font-normal">
              <li><Link href="/about" className="hover:text-[var(--foreground)] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/disclaimer" className="hover:text-[var(--foreground)] transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6">
          <div className="flex flex-col space-y-1.5">
            <Link href="/" className="flex items-center space-x-1.5 w-max">
              <svg
                className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
              <span className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
                VolumeCall
              </span>
            </Link>
            <span className="text-[11px] text-[var(--text-secondary)] font-normal">
              © {currentYear} VolumeCall. All rights reserved.
            </span>
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="max-w-4xl text-[10px] leading-relaxed text-[var(--text-secondary)]">
          <p>
            <span className="font-semibold text-[var(--foreground)]">Disclaimer:</span>{" "}
            VolumeCall provides market information, financial ratios, and research tools for
            informational and educational purposes only. Nothing on this website constitutes
            investment, financial, tax, or legal advice, nor does it represent a solicitation,
            recommendation, or endorsement to buy or sell any securities or financial products.
            Stock trading and investments are subject to market risks. Please consult a SEBI
            registered investment advisor before making any financial decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
