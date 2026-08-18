"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateRetirementCorpus } from "@/lib/financial/planning/retirement";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Sunset, ChevronDown, ChevronUp } from "lucide-react";

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
    question: "How much retirement corpus do I need in India?",
    answer:
      "Your required retirement corpus depends on your current monthly living expenses, years until retirement, expected life expectancy, and inflation. For an urban household spending ₹50,000/month today, retiring in 25 years requires an estimated corpus of ₹3.5 to ₹5.0 Crore.",
  },
  {
    question: "How does inflation impact retirement planning?",
    answer:
      "Inflation increases your future cost of living. At 6% inflation, a monthly expense of ₹50,000 today will expand to ~₹2,15,000 per month in 25 years just to maintain the same standard of living.",
  },
  {
    question: "How is the required monthly SIP for retirement calculated?",
    answer:
      "The calculator computes your required retirement corpus and solves the reverse annuity formula: SIP = Required Corpus / [ ((1 + r)^n - 1) / r ], where r is the monthly pre-retirement return rate.",
  },
  {
    question: "What is the 4% rule in retirement planning?",
    answer:
      "The 4% rule suggests that withdrawing 4% of your total retirement nest egg in the first year (and adjusting for inflation thereafter) gives a high probability that your savings will last at least 30 years.",
  },
  {
    question: "What returns should I assume before and after retirement?",
    answer:
      "Pre-retirement (accumulation phase): 12%–14% p.a. using diversified equity mutual funds. Post-retirement (distribution phase): 7%–9% p.a. using conservative hybrid, debt funds, and senior citizen savings schemes.",
  },
  {
    question: "What is the National Pension System (NPS) and how does it fit in?",
    answer:
      "NPS is a government-regulated retirement savings vehicle offering tax deductions up to ₹2 Lakh under Section 80CCD, with mandatory 40% annuity purchase at retirement.",
  },
  {
    question: "How do medical and healthcare expenses affect retirement?",
    answer:
      "Healthcare inflation in India runs at 10%–14% p.a. Experts recommend purchasing a comprehensive super top-up health insurance policy (₹50L to ₹1Cr coverage) separate from your living expense corpus.",
  },
  {
    question: "What happens if I delay starting my retirement SIP by 5 years?",
    answer:
      "Delaying your retirement SIP by just 5 years can nearly double the monthly savings required to hit the same retirement corpus due to lost compound growth.",
  },
  {
    question: "Can I use an SWP (Systematic Withdrawal Plan) in retirement?",
    answer:
      "Yes. An SWP from mutual funds is the most tax-efficient method to generate monthly pension payouts while letting the remaining corpus continue growing.",
  },
  {
    question: "What life expectancy should I plan for in India?",
    answer:
      "With modern medical advancements, financial planners recommend planning for a life expectancy of at least 85 to 90 years to prevent outliving your retirement savings.",
  },
];

export default function RetirementCalculatorPage() {
  const [expenseInput, setExpenseInput] = useState<string>("50,000");
  const [currentAgeInput, setCurrentAgeInput] = useState<string>("30");
  const [retireAgeInput, setRetireAgeInput] = useState<string>("60");
  const [lifeExpInput, setLifeExpInput] = useState<string>("85");
  const [inflationInput, setInflationInput] = useState<string>("6.0");
  const [preReturnInput, setPreReturnInput] = useState<string>("12.0");
  const [postReturnInput, setPostReturnInput] = useState<string>("8.0");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedExpense = useMemo(() => {
    const raw = expenseInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [expenseInput]);

  const parsedCurrentAge = useMemo(() => {
    const raw = currentAgeInput.trim();
    return !raw || isNaN(Number(raw)) ? 25 : Math.max(18, Number(raw));
  }, [currentAgeInput]);

  const parsedRetireAge = useMemo(() => {
    const raw = retireAgeInput.trim();
    return !raw || isNaN(Number(raw)) ? 60 : Math.max(parsedCurrentAge + 1, Number(raw));
  }, [retireAgeInput, parsedCurrentAge]);

  const parsedLifeExp = useMemo(() => {
    const raw = lifeExpInput.trim();
    return !raw || isNaN(Number(raw)) ? 85 : Math.max(parsedRetireAge + 1, Number(raw));
  }, [lifeExpInput, parsedRetireAge]);

  const parsedInflation = useMemo(() => {
    const raw = inflationInput.trim();
    return !raw || isNaN(Number(raw)) ? 6 : Number(raw);
  }, [inflationInput]);

  const parsedPreReturn = useMemo(() => {
    const raw = preReturnInput.trim();
    return !raw || isNaN(Number(raw)) ? 12 : Number(raw);
  }, [preReturnInput]);

  const parsedPostReturn = useMemo(() => {
    const raw = postReturnInput.trim();
    return !raw || isNaN(Number(raw)) ? 8 : Number(raw);
  }, [postReturnInput]);

  const expenseWords = useMemo(() => numberToWordsIndian(parsedExpense), [parsedExpense]);

  const result = useMemo(() => {
    try {
      return calculateRetirementCorpus(
        parsedExpense,
        parsedCurrentAge,
        parsedRetireAge,
        parsedLifeExp,
        parsedInflation / 100,
        parsedPreReturn / 100,
        parsedPostReturn / 100
      );
    } catch {
      return null;
    }
  }, [parsedExpense, parsedCurrentAge, parsedRetireAge, parsedLifeExp, parsedInflation, parsedPreReturn, parsedPostReturn]);

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
          <span className="text-[var(--foreground)] font-medium">Retirement Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Sunset className="h-3.5 w-3.5" size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Financial Independence & Pension Planning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Retirement Corpus & Monthly SIP Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate your total required retirement corpus, future inflated household living expenses, and the monthly SIP investment needed today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ret-curr-age" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Current Age
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ret-curr-age"
                    type="text"
                    inputMode="numeric"
                    value={currentAgeInput}
                    onChange={(e) => setCurrentAgeInput(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-transparent text-right text-base font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">Yr</span>
                </div>
              </div>
              <div>
                <label htmlFor="ret-ret-age" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Retirement Age
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ret-ret-age"
                    type="text"
                    inputMode="numeric"
                    value={retireAgeInput}
                    onChange={(e) => setRetireAgeInput(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-transparent text-right text-base font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">Yr</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="ret-expense" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Current monthly living expenses
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Household costs today</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                    <input
                      id="ret-expense"
                      type="text"
                      inputMode="numeric"
                      value={expenseInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setExpenseInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {expenseWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{expenseWords}</div>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-[var(--calc-border)]">
              <div>
                <label htmlFor="ret-inf" className="text-[12px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Inflation (% p.a.)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ret-inf"
                    type="text"
                    inputMode="decimal"
                    value={inflationInput}
                    onChange={(e) => setInflationInput(e.target.value)}
                    className="w-full bg-transparent text-right text-base font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1 select-none">%</span>
                </div>
              </div>
              <div>
                <label htmlFor="ret-pre-ret" className="text-[12px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Pre-ret return (% p.a.)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ret-pre-ret"
                    type="text"
                    inputMode="decimal"
                    value={preReturnInput}
                    onChange={(e) => setPreReturnInput(e.target.value)}
                    className="w-full bg-transparent text-right text-base font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1 select-none">%</span>
                </div>
              </div>
              <div>
                <label htmlFor="ret-post-ret" className="text-[12px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Post-ret return (% p.a.)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ret-post-ret"
                    type="text"
                    inputMode="decimal"
                    value={postReturnInput}
                    onChange={(e) => setPostReturnInput(e.target.value)}
                    className="w-full bg-transparent text-right text-base font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1 select-none">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Target Retirement Corpus Needed</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-text-primary)] tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result?.requiredCorpus ?? 0))}
              </span>
              <span className="text-xs font-semibold text-[var(--calc-accent)] mt-1.5 block">
                Required Monthly SIP: ₹{formatIndianNumber(Math.ceil(result?.requiredMonthlySip ?? 0))} / month
              </span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Monthly Expense at Age {parsedRetireAge}</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result?.firstYearMonthlyExpenseAtRetirement ?? 0))} / mo</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Accumulation Period</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">{result?.yearsToRetirement ?? 0} Years</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Retirement Duration</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">{result?.yearsInRetirement ?? 0} Years</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Retirement Calculator?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Retirement Calculator</strong> is an advanced financial planning tool that estimates the total lump-sum nest egg (retirement corpus) you must accumulate before retiring to fund your household lifestyle and healthcare expenses for 25 to 35+ years without running out of money.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does the Retirement Calculation Engine Work?</h2>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Inflate Monthly Living Costs:</strong> Compounds current expenses over the accumulation period at your assumed inflation rate.</li>
                <li><strong>Simulate Post-Retirement SWP:</strong> Runs an inflation-adjusted monthly Systematic Withdrawal Plan simulation across your retirement years until life expectancy.</li>
                <li><strong>Solve for Required Accumulation SIP:</strong> Calculates the exact monthly SIP needed today in equity mutual funds to hit your target corpus.</li>
              </ol>
            </section>

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

          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <RelatedCalculators currentRoute="/calculators/retirement-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
