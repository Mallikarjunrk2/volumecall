import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--background-secondary)] py-8 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
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

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-normal text-[var(--text-secondary)]">
            <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/disclaimer" className="hover:text-[var(--foreground)] transition-colors">
              Disclaimer
            </Link>
          </nav>
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
