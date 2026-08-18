"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateStp } from "@/lib/financial/investments/stp";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { ArrowRightLeft, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

function numberToWordsIndian(num: number): string {
  if (isNaN(num) || num < 0) return "";
  if (num === 0) return "Zero";
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertBelowThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return units[n];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return tens[ten] + (unit ? " " + units[unit] : "");
  }

  function convertUnderThousandWithHundred(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (hundred > 0) str += units[hundred] + " Hundred";
    if (rest > 0) {
      if (str) str += " ";
      str += convertBelowThousand(rest);
    }
    return str;
  }

  let n = Math.floor(num);
  let result = "";
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  const remaining = n % 1000;

  if (crore > 0) result += (crore < 100 ? convertBelowThousand(crore) : convertUnderThousandWithHundred(crore)) + " Crore ";
  if (lakh > 0) result += convertBelowThousand(lakh) + " Lakh ";
  if (thousand > 0) result += convertBelowThousand(thousand) + " Thousand ";
  if (remaining > 0) result += convertUnderThousandWithHundred(remaining);

  return result.trim();
}

const pageFaqItems = [
  {
    question: "What is a Systematic Transfer Plan (STP)?",
    answer:
      "A Systematic Transfer Plan (STP) is an automated mutual fund strategy where an investor parks a lump sum in a low-risk source fund (such as a liquid or ultra-short duration debt fund) and systematically transfers a fixed amount periodically into an equity target fund.",
  },
  {
    question: "How does an STP calculator work?",
    answer:
      "An STP calculator models dual-fund accounting: it grows the remaining source fund balance at the source return rate, transfers fixed monthly tranches to the target fund, and compounds the accumulated units in the target fund at the target return rate.",
  },
  {
    question: "Why is STP better than a direct lump sum investment in equity?",
    answer:
      "Deploying a large lump sum directly into equity exposes you to the risk of investing at a market peak. An STP spaces out entry points over 12 to 36 months, providing rupee-cost averaging while earning 6%–7% p.a. on the idle cash in the liquid fund.",
  },
  {
    question: "What is the difference between STP and SIP?",
    answer:
      "In an SIP, installments are deducted from your bank savings account (which earns 2.5%–3.5% interest). In an STP, installments are transferred from a liquid/debt mutual fund (which historically yields 6%–7% p.a.), generating higher returns on the waiting capital.",
  },
  {
    question: "Can I do an STP between different mutual fund companies (AMCs)?",
    answer:
      "No. An automated STP can only be executed between schemes within the same Asset Management Company (mutual fund house), such as transferring from HDFC Liquid Fund to HDFC Top 100 Fund.",
  },
  {
    question: "What are the common types of STP?",
    answer:
      "The three common STP types are Fixed STP (transferring a fixed rupee amount), Capital Appreciation STP (transferring only the profit/gains from the source fund), and Flexi STP (variable transfers based on market valuation triggers).",
  },
  {
    question: "Are STP transfers subject to taxes in India?",
    answer:
      "Yes. Every transfer from the source fund is treated as a redemption and is subject to capital gains tax according to debt fund taxation rules applicable for that financial year.",
  },
  {
    question: "What is the ideal duration for an STP into equity funds?",
    answer:
      "Financial planners typically recommend an STP duration of 6 to 12 months for moderate lump sums, and 18 to 36 months for very large windfalls (like property sales or retirement gratuities) to smooth equity volatility.",
  },
  {
    question: "What happens when the source fund balance runs out?",
    answer:
      "Once the source fund balance reaches zero, the automated STP simply concludes. Your accumulated capital continues compounding inside the target equity fund.",
  },
  {
    question: "Are STP return estimates guaranteed?",
    answer:
      "No. Mutual fund returns are market-linked and not guaranteed. The calculator provides illustrative estimates based on user-entered annualized return assumptions.",
  },
];

export default function StpCalculatorPage() {
  const [sourceCorpus, setSourceCorpus] = useState<string>("10,00,000");
  const [monthlyTransfer, setMonthlyTransfer] = useState<string>("25,000");
  const [sourceReturn, setSourceReturn] = useState<string>("6");
  const [targetReturn, setTargetReturn] = useState<string>("12");
  const [monthsInput, setMonthsInput] = useState<string>("36");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedSource = useMemo(() => {
    const raw = sourceCorpus.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [sourceCorpus]);

  const parsedTransfer = useMemo(() => {
    const raw = monthlyTransfer.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [monthlyTransfer]);

  const parsedSourceReturn = useMemo(() => {
    const raw = sourceReturn.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [sourceReturn]);

  const parsedTargetReturn = useMemo(() => {
    const raw = targetReturn.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [targetReturn]);

  const parsedMonths = useMemo(() => {
    const raw = monthsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [monthsInput]);

  const sourceWords = useMemo(() => numberToWordsIndian(parsedSource), [parsedSource]);
  const transferWords = useMemo(() => numberToWordsIndian(parsedTransfer), [parsedTransfer]);

  // STP Calculation using financial engine
  const result = useMemo(() => {
    return calculateStp(
      parsedSource,
      parsedTransfer,
      parsedSourceReturn / 100,
      parsedTargetReturn / 100,
      parsedMonths
    );
  }, [parsedSource, parsedTransfer, parsedSourceReturn, parsedTargetReturn, parsedMonths]);

  const combinedValue = result.sourceRemaining + result.targetValue;
  const totalGain = combinedValue - parsedSource;

  const sourcePercent = Math.min(100, Math.max(0, (parsedSource / 10000000) * 100));
  const transferPercent = Math.min(100, Math.max(0, (parsedTransfer / 500000) * 100));
  const monthsPercent = Math.min(100, Math.max(0, (parsedMonths / 120) * 100));

  const getSliderTrackStyle = (percent: number) => ({
    background: `linear-gradient(to right, var(--calc-accent) 0%, var(--calc-accent) ${percent}%, var(--calc-track-bg) ${percent}%, var(--calc-track-bg) 100%)`,
  });

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Breadcrumbs */}
        <div className="text-xs text-[var(--text-secondary)] mb-3 flex items-center space-x-1.5 font-normal">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calculators" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium">STP Calculator</span>
        </div>

        {/* Page Title & Intro */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Inter-Fund Systematic Transfer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Systematic Transfer Plan (STP) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate systematic transfers from a source fund (e.g. debt/liquid fund) to a target fund (e.g. equity fund) and track combined portfolio value.
          </p>
        </div>

        {/* Calculator Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 calc-grid mb-10">
          {/* Left Column: Input Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            {/* Input 1: Source Fund Initial */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="stp-source" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Source fund initial balance
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Lump sum parked in liquid/debt fund</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                    <input
                      id="stp-source"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={sourceCorpus}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setSourceCorpus(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {sourceWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{sourceWords}</div>}
              <input
                type="range"
                min="0"
                max="10000000"
                step="10000"
                autoComplete="off"
                value={Math.min(10000000, Math.max(0, parsedSource))}
                onChange={(e) => setSourceCorpus(formatIndianNumber(Number(e.target.value)))}
                style={getSliderTrackStyle(sourcePercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 2: Monthly Transfer */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="stp-transfer" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Monthly transfer amount
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Fixed tranche shifted to equity fund monthly</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                    <input
                      id="stp-transfer"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={monthlyTransfer}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setMonthlyTransfer(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-28 sm:w-36 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {transferWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{transferWords}</div>}
              <input
                type="range"
                min="0"
                max="500000"
                step="1000"
                autoComplete="off"
                value={Math.min(500000, Math.max(0, parsedTransfer))}
                onChange={(e) => setMonthlyTransfer(formatIndianNumber(Number(e.target.value)))}
                style={getSliderTrackStyle(transferPercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 3 & 4: Source & Target Returns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-[var(--calc-border)]">
              <div className="space-y-2">
                <label htmlFor="stp-src-return" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                  Source return (% p.a.)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)]">
                  <input
                    id="stp-src-return"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={sourceReturn}
                    onChange={(e) => setSourceReturn(e.target.value)}
                    className="w-full bg-transparent text-right text-base font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="stp-tgt-return" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                  Target return (% p.a.)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)]">
                  <input
                    id="stp-tgt-return"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={targetReturn}
                    onChange={(e) => setTargetReturn(e.target.value)}
                    className="w-full bg-transparent text-right text-base font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">%</span>
                </div>
              </div>
            </div>

            {/* Input 5: Duration */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="stp-duration" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Duration (months)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Total systematic transfer window</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="stp-duration"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={monthsInput}
                    onChange={(e) => setMonthsInput(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">Mo</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="1"
                autoComplete="off"
                value={Math.min(120, Math.max(0, parsedMonths))}
                onChange={(e) => setMonthsInput(e.target.value)}
                style={getSliderTrackStyle(monthsPercent)}
                className="financial-slider"
              />
            </div>
          </div>

          {/* Right Column: Output Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Combined Portfolio Value</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-text-primary)] tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(combinedValue))}
              </span>
              <span className="text-xs font-medium text-[var(--calc-accent)] mt-1.5 block">
                Total Gain: +₹{formatIndianNumber(Math.round(totalGain))}
              </span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Capital Transferred</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result.totalTransferred))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Source Fund Remaining Balance</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result.sourceRemaining))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Target Equity Fund Final Value</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(result.targetValue))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="flex items-start space-x-2.5 p-4 bg-amber-500/5 border border-amber-200/40 dark:border-amber-900/20 rounded-xl mb-12 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Disclaimer:</strong> STP calculator outputs are illustrative estimates based on user-entered return assumptions. Mutual fund investments are subject to market risks. Actual NAVs fluctuate and are not guaranteed. Exit loads and capital gains taxes on source fund redemptions are not factored into projections.
          </p>
        </div>

        {/* Comprehensive Educational Content & Related Calculators Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Systematic Transfer Plan (STP)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Systematic Transfer Plan (STP)</strong> is an automated mutual fund strategy that allows an investor to periodically shift a predetermined amount of money from one mutual fund scheme (the <em>source fund</em>) to another scheme (the <em>target fund</em>) within the same Asset Management Company (AMC).
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                STP is most commonly utilized when an investor receives a significant lump sum (such as an annual bonus, property sale proceeds, or retirement gratuity). Rather than risking all the capital in the equity market at once or leaving it in a low-yield bank savings account, the investor parks the lump sum in a liquid or short-term debt fund (yielding 6%–7% p.a.) and sets up an automated monthly STP into diversified equity funds over 12 to 36 months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does an STP Calculator Work?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                An STP calculator models dual-fund financial mechanics across every month of the transfer timeline:
              </p>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Track Source Fund Balance:</strong> Accrues monthly interest on the un-transferred balance in the liquid/debt fund.</li>
                <li><strong>Execute Monthly Transfer:</strong> Deducts the fixed monthly installment from the source fund.</li>
                <li><strong>Credit Target Fund:</strong> Adds the installment to the equity target fund and compounds accumulated units at the equity return rate.</li>
                <li><strong>Compute Combined Valuation:</strong> Evaluates the total combined wealth (Source Balance + Target Equity Value) at every monthly milestone.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is an STP Calculated?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                For each month <em>m</em> from 1 to the duration:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div>Source<sub>m</sub> = Source<sub>m-1</sub> × (1 + r<sub>source</sub>) - TransferAmount</div>
                <div>Target<sub>m</sub> = Target<sub>m-1</sub> × (1 + r<sub>target</sub>) + TransferAmount</div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>r<sub>source</sub></strong> = Monthly effective rate of source fund = (1 + Source Return)<sup>1/12</sup> - 1</div>
                  <div><strong>r<sub>target</sub></strong> = Monthly effective rate of target fund = (1 + Target Return)<sup>1/12</sup> - 1</div>
                  <div><strong>Combined Portfolio</strong> = Source<sub>m</sub> + Target<sub>m</sub></div>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Our financial calculation engine (<code className="text-xs bg-neutral-100 dark:bg-[#1a1a1a] px-1 py-0.5 rounded">calculateStp</code>) executes this dual-fund simulation month by month to provide exact portfolio balances.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">STP Calculation Example</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Consider an investor with a ₹10 Lakh lump sum setting up a 3-year (36 months) STP:
              </p>
              <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1 list-disc list-inside mb-4">
                <li><strong>Source Fund (Liquid Fund):</strong> ₹10,00,000 initial, assumed 6% return p.a.</li>
                <li><strong>Monthly Transfer Amount:</strong> ₹25,000 / month</li>
                <li><strong>Target Fund (Equity Fund):</strong> Assumed 12% return p.a.</li>
                <li><strong>Duration:</strong> 36 Months</li>
              </ul>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">Total Capital Transferred (₹25,000 × 36)</span>
                  <span className="font-bold tabular-nums">₹9,00,000</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">Source Liquid Fund Remaining Balance</span>
                  <span className="font-bold tabular-nums">₹2,09,926</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">Target Equity Fund Final Value</span>
                  <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹10,87,358</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span>Combined Final Portfolio Value</span>
                  <span className="tabular-nums">₹12,97,284</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                By using an STP, the investor achieved complete rupee-cost averaging in equities while earning over <strong>₹2.97 Lakhs in cumulative growth</strong> across both funds.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How to Use the STP Calculator</h2>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Enter Source Fund Initial Balance:</strong> Input the lump sum cash parked in your liquid/debt mutual fund.</li>
                <li><strong>Specify Monthly Transfer:</strong> Enter the tranche amount you wish transferred to equity each month.</li>
                <li><strong>Set Source Return (%):</strong> Input expected return on the debt/liquid fund (typically 6% to 7% p.a.).</li>
                <li><strong>Set Target Return (%):</strong> Input expected long-term return on the equity fund (typically 12% to 15% p.a.).</li>
                <li><strong>Choose Duration:</strong> Enter the number of months for the transfer plan.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Benefits of a Systematic Transfer Plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Rupee Cost Averaging for Lump Sums</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Eliminates the fear of investing a large lump sum right before a market correction by spreading entry over multiple months.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Higher Yield on Idle Cash</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Liquid and ultra-short debt funds historically yield 6%–7% p.a., significantly outperforming regular bank savings interest (2.5%–3.5%).
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Automated Discipline</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Avoids emotional hesitation during market volatility by executing fixed monthly transfers automatically without manual intervention.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Dual Compounding Engine</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Both your source debt fund and target equity fund work simultaneously, maximizing capital efficiency across the entire tenure.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">STP vs SIP vs Direct Lumpsum</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Compare how STP fits into your broader asset allocation and cash deployment strategy:
              </p>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Feature</th>
                      <th className="px-4 py-3 text-left">Systematic Transfer Plan (STP)</th>
                      <th className="px-4 py-3 text-left">Systematic Investment Plan (SIP)</th>
                      <th className="px-4 py-3 text-left">Direct Lumpsum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Source of Funds</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Liquid / Debt mutual fund</td>
                      <td className="px-4 py-2.5">Bank Savings Account</td>
                      <td className="px-4 py-2.5">Bank Account (Single debit)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Yield on Idle Funds</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">6.0% – 7.0% p.a.</td>
                      <td className="px-4 py-2.5">2.5% – 3.5% p.a.</td>
                      <td className="px-4 py-2.5">N/A (invested immediately)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Best Suited For</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Deploying large windfalls safely</td>
                      <td className="px-4 py-2.5">Monthly salaried savings</td>
                      <td className="px-4 py-2.5">Long-term cash with high risk tolerance</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Market Timing Risk</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Low (Rupee-cost averaged)</td>
                      <td className="px-4 py-2.5">Low (Rupee-cost averaged)</td>
                      <td className="px-4 py-2.5">High (Vulnerable to market peaks)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Important Factors & Taxation Considerations</h2>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
                <p>
                  <strong>1. Intra-AMC Rule:</strong> In India, automated STP is only permitted between mutual fund schemes within the same fund house (AMC). You cannot STP directly from an AMC &apos;A&apos; debt fund to an AMC &apos;B&apos; equity fund.
                </p>
                <p>
                  <strong>2. Taxation on Source Fund Redemptions:</strong> Each monthly transfer is technically a redemption of units from the source debt fund and an investment into the target equity fund. Capital gains on debt fund units are taxed as per your applicable income tax slab rate.
                </p>
                <p>
                  <strong>3. Exit Loads:</strong> Choose a liquid fund with zero exit load after 7 days as your source scheme to avoid premature exit penalty charges.
                </p>
              </div>
            </section>

            {/* FAQ Accordion Section */}
            <div className="border-t border-[var(--border)] pt-8">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {pageFaqItems.map((faq, idx) => (
                  <div key={idx} className="border border-[var(--border)] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-semibold text-neutral-900 dark:text-white bg-white dark:bg-[#0a0a0a] hover:bg-neutral-50 dark:hover:bg-[#121212]/50 transition-colors focus:outline-none"
                      aria-expanded={openFaq === idx}
                    >
                      <span>{faq.question}</span>
                      {openFaq === idx ? <ChevronUp className="h-4 w-4 shrink-0 ml-3" /> : <ChevronDown className="h-4 w-4 shrink-0 ml-3" />}
                    </button>
                    {openFaq === idx && (
                      <div className="px-5 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed bg-neutral-50/50 dark:bg-[#0a0a0a]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Related Calculators Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <RelatedCalculators currentRoute="/calculators/stp-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
