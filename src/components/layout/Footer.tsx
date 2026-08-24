import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] bg-[#000000] text-white mt-auto font-sans flex flex-col justify-between overflow-hidden select-none">

      {/* ─── 1. FULL-BLEED ATMOSPHERIC DEEP GREEN EMERALD GLOW ─── */}
      {/* Viewport-Wide Atmospheric Radial Glow (Extends Edge-to-Edge) */}
      <div className="absolute inset-0 w-full bg-[radial-gradient(ellipse_120%_80%_at_50%_50%,_var(--tw-gradient-stops))] from-emerald-600/18 via-teal-950/10 to-transparent pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] sm:h-[450px] lg:h-[550px] bg-emerald-500/10 blur-[180px] pointer-events-none z-0" />

      {/* Seamless Vertical Black Blend Mask (Top 100% Black fading into Emerald) */}
      <div className="absolute inset-x-0 top-0 h-32 sm:h-44 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-x-0 bottom-0 h-24 sm:h-36 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent pointer-events-none z-0" />

      {/* ─── 2. BRAND ARTWORK (LOGO ONLY) ─────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 overflow-hidden">
        {/* Balanced Green V Logo (Ultra-subtle background mark) */}
        <div className="relative w-[200px] sm:w-[320px] md:w-[450px] lg:w-[580px] xl:w-[680px] h-[200px] sm:h-[320px] md:h-[450px] lg:h-[580px] xl:h-[680px] flex items-center justify-center opacity-[0.04] sm:opacity-[0.06] transform -translate-y-2 sm:-translate-y-4 filter drop-shadow-[0_0_120px_rgba(23,192,131,0.15)]">
          <Image
            src="/volumecall-v-green.svg"
            alt=""
            fill
            className="object-contain filter drop-shadow-[0_30px_60px_rgba(23,192,131,0.15)]"
            priority
          />
        </div>
      </div>

      {/* ─── 3. TOP OVERLAID NAVIGATION & BRAND INFO ─────────────────────── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-6 border-b border-neutral-900/60">

          {/* Brand Intro */}
          <div className="lg:col-span-4 space-y-3">
            <Link href="/" className="inline-flex items-center space-x-2.5 focus:outline-none">
              <svg viewBox="0 0 200 200" className="h-5 w-5 shrink-0 fill-white" aria-hidden="true">
                <rect x="40" y="44" width="36" height="50" rx="11" />
                <rect x="76" y="100" width="36" height="50" rx="11" />
                <rect x="128" y="44" width="36" height="106" rx="11" />
              </svg>
              <span className="text-base font-bold tracking-tight text-white uppercase font-mono">
                VolumeCall
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal max-w-xs">
              Indian equity research &amp; valuation terminal. Fundamentals, financial statements, and price history — no ads, no tips, just data.
            </p>
          </div>

          {/* 4 Compact Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {/* Markets */}
            <div className="flex flex-col space-y-2.5">
              <h4 className="font-bold text-neutral-200 uppercase tracking-widest text-[11px] font-mono">
                Markets
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li><Link href="/markets" className="hover:text-emerald-400 transition-colors">Nifty 50</Link></li>
                <li><Link href="/markets" className="hover:text-emerald-400 transition-colors">Sensex</Link></li>
                <li><Link href="/markets" className="hover:text-emerald-400 transition-colors">Bank Nifty</Link></li>
                <li><Link href="/markets" className="hover:text-emerald-400 transition-colors">Midcap</Link></li>
                <li><Link href="/markets" className="hover:text-emerald-400 transition-colors">Smallcap</Link></li>
                <li><Link href="/markets" className="hover:text-emerald-400 transition-colors">Gold Tracker</Link></li>
              </ul>
            </div>

            {/* Stocks & Research */}
            <div className="flex flex-col space-y-2.5">
              <h4 className="font-bold text-neutral-200 uppercase tracking-widest text-[11px] font-mono">
                Stocks &amp; Research
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li><Link href="/stocks" className="hover:text-emerald-400 transition-colors">Browse Stocks</Link></li>
                <li><Link href="/compare" className="hover:text-emerald-400 transition-colors">Compare Stocks</Link></li>
                <li><Link href="/ipo" className="hover:text-emerald-400 transition-colors">IPO Dashboard</Link></li>
                <li><Link href="/calculators/dcf-calculator" className="hover:text-emerald-400 transition-colors">DCF Valuation</Link></li>
                <li><Link href="/calculators/reverse-dcf-calculator" className="hover:text-emerald-400 transition-colors">Reverse DCF</Link></li>
              </ul>
            </div>

            {/* Financial Calculators */}
            <div className="flex flex-col space-y-2.5">
              <h4 className="font-bold text-neutral-200 uppercase tracking-widest text-[11px] font-mono">
                Calculators
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li><Link href="/calculators" className="font-semibold text-emerald-400 hover:underline">All Calculators →</Link></li>
                <li><Link href="/calculators/sip-calculator" className="hover:text-emerald-400 transition-colors">SIP Calculator</Link></li>
                <li><Link href="/calculators/goal-sip-calculator" className="hover:text-emerald-400 transition-colors">Goal SIP</Link></li>
                <li><Link href="/calculators/step-up-sip-calculator" className="hover:text-emerald-400 transition-colors">Step-Up SIP</Link></li>
                <li><Link href="/calculators/swp-calculator" className="hover:text-emerald-400 transition-colors">SWP Calculator</Link></li>
                <li><Link href="/calculators/stp-calculator" className="hover:text-emerald-400 transition-colors">STP Calculator</Link></li>
                <li><Link href="/calculators/emi-calculator" className="hover:text-emerald-400 transition-colors">EMI Calculator</Link></li>
                <li><Link href="/calculators/cagr-calculator" className="hover:text-emerald-400 transition-colors">CAGR Calculator</Link></li>
                <li><Link href="/calculators/retirement-calculator" className="hover:text-emerald-400 transition-colors">Retirement</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col space-y-2.5">
              <h4 className="font-bold text-neutral-200 uppercase tracking-widest text-[11px] font-mono">
                Company
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. BOTTOM OVERLAID COPYRIGHT, LINKS & FINANCIAL DISCLAIMER ───── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-4 border-t border-neutral-900/60">

          {/* Disclaimer on Left (50% Opacity) */}
          <div className="md:col-span-7 text-[10px] leading-relaxed text-neutral-400 opacity-50 font-sans">
            <p>
              <span className="font-semibold text-neutral-300">Disclaimer:</span>{" "}
              VolumeCall provides market information, financial ratios, and calculation tools for
              informational and educational purposes only. Nothing on this website constitutes
              investment, financial, tax, or legal advice, nor does it represent a solicitation or
              recommendation to buy or sell securities. Investments are subject to market risks.
              Consult a SEBI-registered financial advisor before making investment decisions.
            </p>
          </div>

          {/* Legal Links & Copyright on Right */}
          <div className="md:col-span-5 flex flex-col items-start md:items-end space-y-2 font-mono">
            {/* Legal Links Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
              <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">Disclaimer</Link>
              <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
            </div>
            {/* Copyright Row Below Links */}
            <span className="text-xs text-neutral-500">
              © {currentYear} VolumeCall. All rights reserved.
            </span>
          </div>

        </div>
      </div>

    </footer>
  );
}

export default Footer;




