"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateSip } from "@/lib/financial/investments/sip";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { ChevronDown, ChevronUp, AlertTriangle, Target, ArrowRight, Calculator } from "lucide-react";

/**
 * Converts a non-negative integer number to Indian numbering words (Thousand, Lakh, Crore).
 */
function numberToWordsIndian(num: number): string {
  if (isNaN(num) || num < 0) return "";
  if (num === 0) return "Zero";

  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

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
    if (hundred > 0) {
      str += units[hundred] + " Hundred";
    }
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

  if (crore > 0) {
    result += (crore < 100 ? convertBelowThousand(crore) : convertUnderThousandWithHundred(crore)) + " Crore ";
  }
  if (lakh > 0) {
    result += convertBelowThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    result += convertBelowThousand(thousand) + " Thousand ";
  }
  if (remaining > 0) {
    result += convertUnderThousandWithHundred(remaining);
  }

  return result.trim();
}

/**
 * Format expected return string to words (e.g. 0 -> Zero Percent, 12 -> Twelve Percent, 10.5 -> Ten Point Five Percent).
 */
function formatReturnToWords(valStr: string): string {
  if (valStr === "" || isNaN(Number(valStr))) return "";
  const num = Number(valStr);
  if (num < 0) return "";
  if (num === 0) return "Zero Percent";

  const parts = valStr.split(".");
  const intPart = Math.floor(Number(parts[0]));
  const intWords = numberToWordsIndian(intPart) || "Zero";

  if (parts.length > 1 && parts[1].length > 0) {
    const digitWords = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const decWords = parts[1].split("").map((d) => digitWords[Number(d)] || d).join(" ");
    return `${intWords} Point ${decWords} Percent`;
  }

  return `${intWords} Percent`;
}

/**
 * Format duration string to words (e.g. 0 -> Zero Years, 10 -> Ten Years, 1 -> One Year).
 */
function formatDurationToWords(valStr: string): string {
  if (valStr === "" || isNaN(Number(valStr))) return "";
  const num = Number(valStr);
  if (num < 0) return "";
  if (num === 0) return "Zero Years";
  const words = numberToWordsIndian(num);
  if (!words) return "";
  return num === 1 ? `${words} Year` : `${words} Years`;
}

export default function SipCalculatorPage() {
  // 1. Raw string input states initialized to standard sensible defaults (₹25,000 / 12% / 10 Years)
  const [paymentInput, setPaymentInput] = useState<string>("25,000");
  const [returnInput, setReturnInput] = useState<string>("12");
  const [yearsInput, setYearsInput] = useState<string>("10");

  // 2. Schedule & FAQ Toggle State
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper to format raw integer digits into Indian number format
  const formatRawDigits = (raw: string): string => {
    if (!raw) return "";
    const num = Number(raw);
    if (isNaN(num)) return raw;
    return formatIndianNumber(num);
  };

  // Monthly Investment Change Handler
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanDigits = val.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    if (cleanDigits === "") {
      setPaymentInput("");
      return;
    }
    setPaymentInput(formatRawDigits(cleanDigits));
  };

  // Expected Return Change Handler
  const handleReturnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let clean = val.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }
    if (clean.startsWith("0") && clean.length > 1 && clean[1] !== ".") {
      clean = clean.replace(/^0+/, "");
    }
    setReturnInput(clean);
  };

  // Duration Change Handler
  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanDigits = val.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    setYearsInput(cleanDigits);
  };

  // Parsed numeric values for calculation layer
  const parsedPayment = useMemo(() => {
    const raw = paymentInput.replace(/,/g, "").trim();
    if (!raw || isNaN(Number(raw))) return 0;
    return Math.max(0, Number(raw));
  }, [paymentInput]);

  const parsedReturn = useMemo(() => {
    const raw = returnInput.trim();
    if (!raw || isNaN(Number(raw))) return 0;
    return Math.max(0, Number(raw));
  }, [returnInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    if (!raw || isNaN(Number(raw))) return 0;
    return Math.max(0, Number(raw));
  }, [yearsInput]);

  // Derived word representations
  const paymentWords = useMemo(() => {
    return numberToWordsIndian(parsedPayment);
  }, [parsedPayment]);

  const returnWords = useMemo(() => {
    return formatReturnToWords(returnInput);
  }, [returnInput]);

  const yearsWords = useMemo(() => {
    return formatDurationToWords(yearsInput);
  }, [yearsInput]);

  // Validation messages for negative values
  const paymentError = paymentInput !== "" && Number(paymentInput.replace(/,/g, "")) < 0 ? "Monthly investment cannot be negative." : null;
  const returnError = returnInput !== "" && Number(returnInput) < 0 ? "Expected return cannot be negative." : null;
  const yearsError = yearsInput !== "" && Number(yearsInput) < 0 ? "Duration cannot be negative." : null;

  // 3. Perform SIP calculation dynamically using the source-of-truth engine (using standard "end" timing)
  const sipResult = useMemo(() => {
    return calculateSip(
      parsedPayment,
      parsedReturn / 100,
      parsedYears,
      "monthly",
      "end", // Standard / default SIP timing convention
      true,  // treats rate as Effective Annual Rate (EAR)
      true   // generates month-by-month schedule
    );
  }, [parsedPayment, parsedReturn, parsedYears]);

  const { investedAmount, totalValue, estimatedReturns, schedule = [] } = sipResult;

  // 4. Calculate SVG Donut chart properties
  const principalPercentage = totalValue > 0 ? (investedAmount / totalValue) * 100 : 50;
  const interestPercentage = 100 - principalPercentage;

  // Circle perimeter for SVG stroke-dasharray (radius = 48, perimeter = 2 * PI * r = 301.59)
  const strokePerimeter = 301.59;
  
  // Exact non-overlapping arc lengths
  const principalArcLength = (principalPercentage / 100) * strokePerimeter;
  const interestArcLength = (interestPercentage / 100) * strokePerimeter;

  // Slider Fill Progress Percentages
  const paymentPercent = Math.min(100, Math.max(0, (parsedPayment / 2000000) * 100));
  const returnPercent = Math.min(100, Math.max(0, (parsedReturn / 30) * 100));
  const yearsPercent = Math.min(100, Math.max(0, (parsedYears / 40) * 100));

  const getSliderTrackStyle = (percent: number) => ({
    background: `linear-gradient(to right, var(--calc-accent) 0%, var(--calc-accent) ${percent}%, var(--calc-track-bg) ${percent}%, var(--calc-track-bg) 100%)`,
  });

  // FAQ Items array matching layout.tsx structured data
  const faqItems = [
    {
      q: "What is a SIP calculator?",
      a: "A SIP calculator is a financial planning tool that estimates the future value of regular monthly investments in mutual funds or other investment schemes. By entering your monthly SIP amount, expected annual return, and investment duration, the calculator projects your total investment, estimated returns, and total maturity value."
    },
    {
      q: "How does a SIP calculator calculate returns?",
      a: "A SIP calculator uses the future value of annuity formula to compound each monthly installment over its investment period. It converts the expected annual return into a monthly periodic rate and applies compounding to each monthly deposit across the selected investment tenure."
    },
    {
      q: "How is the monthly return calculated from the annual return?",
      a: "This calculator converts the expected annual return rate into a monthly periodic rate using the Effective Annual Rate (EAR) formula: Monthly Rate = (1 + Annual Return)^(1/12) - 1. For example, a 12% annual return converts to an effective monthly rate of approximately 0.9489% (or ~0.95% per month)."
    },
    {
      q: "Why shouldn't I simply divide the annual return by 12?",
      a: "Simply dividing an annual return by 12 (e.g. 12% ÷ 12 = 1% per month) assumes nominal rate division. However, compounding 1% every month actually results in an effective annual rate of 12.68%, which is higher than 12%. Converting the annual return to its exact monthly equivalent rate ensures that compounding 12 times yields precisely the expected annual return."
    },
    {
      q: "What return rate should I enter in a SIP calculator?",
      a: "The return rate you enter should reflect your expected long-term annual return from the mutual fund category you plan to invest in. Historically, Indian equity mutual funds (like Nifty 50 index funds or diversified equity funds) have delivered long-term returns in the range of 10% to 15% per annum, while debt funds typically deliver 6% to 8%. Past performance is not a guarantee of future returns."
    },
    {
      q: "Are SIP calculator results guaranteed?",
      a: "No, SIP calculator results are illustrative estimates based on a constant assumed rate of return. Mutual fund investments are subject to market risks, and actual market returns fluctuate daily. Realized returns may be higher or lower than calculated estimates."
    },
    {
      q: "How much should I invest in a SIP every month?",
      a: "The ideal monthly SIP amount depends on your personal financial goals, monthly income, essential expenses, emergency savings, and risk tolerance. A common guideline is to invest 15% to 30% of your net monthly income toward long-term financial goals."
    },
    {
      q: "How long should I invest through SIP?",
      a: "SIPs work best over longer horizons (such as 5 to 20+ years) because compounding accelerates significantly in later years. Longer investment tenures also help smooth out short-term equity market volatility through rupee-cost averaging."
    },
    {
      q: "What is the difference between total invested amount and estimated returns?",
      a: "Total invested amount is the cumulative total of money you deposit out of pocket over the investment period (Monthly SIP × 12 months × Duration). Estimated returns represent the additional wealth generated through compound interest on your deposits. Total maturity value is the sum of total invested and estimated returns."
    },
    {
      q: "Can I use a SIP calculator for mutual funds?",
      a: "Yes, the SIP calculator is primarily designed for mutual fund SIP investments in equity, hybrid, or debt funds. It can also be used to estimate growth for any recurring monthly investment scheme with compound returns."
    },
    {
      q: "Can SIP calculators predict actual mutual fund returns?",
      a: "No, SIP calculators cannot predict exact market returns. They model expected growth assuming a uniform annual rate of return. Real mutual fund returns vary month to month depending on market conditions, economic factors, and fund management."
    },
    {
      q: "Does a higher SIP amount always mean higher returns?",
      a: "Investing a higher monthly SIP amount increases your total invested capital and overall maturity value proportionally. However, the return percentage (rate of return) depends on market performance, not the size of your investment."
    },
    {
      q: "Does increasing the SIP investment period increase the maturity value?",
      a: "Yes, increasing the investment duration dramatically increases the final maturity value due to the exponential nature of compound interest. Extending your SIP by even a few years can double your overall estimated returns."
    },
    {
      q: "What is the difference between SIP and lump sum investment?",
      a: "In a SIP (Systematic Investment Plan), you invest a fixed amount regularly every month, benefiting from rupee-cost averaging and disciplined savings. In a lump sum investment, you deposit the entire capital at once on day one. SIP reduces the risk of bad market timing compared to a single lump sum deposit."
    },
    {
      q: "Are taxes and mutual fund expenses included in SIP calculator results?",
      a: "No, standard SIP calculator results do not subtract capital gains taxes (like LTCG or STCG tax in India), mutual fund expense ratios, or exit loads. The calculated total value represents gross estimated maturity before taxes and fees."
    },
    {
      q: "How much SIP do I need to reach ₹1 crore?",
      a: "The monthly SIP required to reach ₹1 Crore depends on your investment horizon and expected annual return. At an assumed 12% annual return, you need approximately ₹43,000/month for 10 years, ₹15,000/month for 15 years, or ₹6,500/month for 20 years to accumulate ₹1 Crore."
    },
    {
      q: "How much should I invest to reach ₹5 crore?",
      a: "To accumulate a target corpus of ₹5 Crore at an assumed 12% annual return, you need approximately ₹2,15,000/month for 10 years, ₹75,000/month for 15 years, or ₹32,000/month for 20 years."
    },
    {
      q: "How is the required SIP calculated for a financial goal?",
      a: "A goal planner calculates the required periodic payment by solving the future value of annuity formula in reverse: P = Goal Corpus / [ ((1 + r)^n - 1) / r ], where r is the monthly periodic return rate and n is total investment periods."
    },
    {
      q: "Can I calculate the SIP required for a specific target amount?",
      a: "Yes, our Goal Planner section allows you to enter any target goal corpus (such as ₹50 Lakhs, ₹1 Crore, or ₹5 Crores) and choose your timeline to immediately calculate the required investment."
    },
    {
      q: "Does a higher expected return reduce the required SIP?",
      a: "Yes, a higher expected annual return rate means compound interest generates a larger portion of your target corpus, thereby reducing the required monthly out-of-pocket investment."
    },
    {
      q: "Can I calculate quarterly or yearly investments for a goal?",
      a: "Yes, our Goal Planner supports Monthly, Quarterly, and Yearly investment frequencies. It calculates the exact required payment for each frequency using periodic compounding rates."
    },
    {
      q: "Are the return assumptions guaranteed?",
      a: "No, return assumptions used in goal planning calculations are illustrative scenarios. Mutual fund investments are market-linked, and actual realized returns will vary based on market conditions."
    }
  ];

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
          <span className="text-[var(--foreground)] font-medium">SIP Calculator</span>
        </div>

        {/* Title Section */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Calculator className="h-3.5 w-3.5" size={14} strokeWidth={2} aria-hidden="true" />
            <span>Systematic Investment Planning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            SIP Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate expected maturity wealth and compound interest on monthly mutual fund SIP investments.
          </p>
        </div>

        {/* Calculator Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 calc-grid mb-10">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            
            {/* Input 1: Monthly Investment */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <label htmlFor="sip-monthly-investment" className="text-[15px] font-semibold text-[var(--calc-text-primary)]">
                  Monthly investment
                </label>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                    <input
                      id="sip-monthly-investment"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={paymentInput}
                      onChange={handlePaymentChange}
                      className="w-28 sm:w-36 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {paymentWords && (
                <div className="text-xs font-medium text-[var(--calc-accent)] text-right">
                  {paymentWords}
                </div>
              )}
              {paymentError && (
                <p className="text-xs text-red-500 font-medium text-right">{paymentError}</p>
              )}

              {/* Horizontal Range Slider */}
              <input
                type="range"
                min="0"
                max="2000000"
                step="1000"
                autoComplete="off"
                value={Math.min(2000000, Math.max(0, parsedPayment))}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPaymentInput(formatIndianNumber(val));
                }}
                style={getSliderTrackStyle(paymentPercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 2: Expected Return Rate */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <label htmlFor="sip-expected-return" className="text-[15px] font-semibold text-[var(--calc-text-primary)]">
                  Expected return rate (p.a.)
                </label>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <input
                      id="sip-expected-return"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={returnInput}
                      onChange={handleReturnChange}
                      className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">%</span>
                  </div>
                </div>
              </div>

              {returnWords && (
                <div className="text-xs font-medium text-[var(--calc-accent)] text-right">
                  {returnWords}
                </div>
              )}
              {returnError && (
                <p className="text-xs text-red-500 font-medium text-right">{returnError}</p>
              )}

              {/* Horizontal Range Slider */}
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                autoComplete="off"
                value={Math.min(30, Math.max(0, parsedReturn))}
                onChange={(e) => setReturnInput(e.target.value)}
                style={getSliderTrackStyle(returnPercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 3: Duration */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <label htmlFor="sip-time-period" className="text-[15px] font-semibold text-[var(--calc-text-primary)]">
                  Investment duration
                </label>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <input
                      id="sip-time-period"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={yearsInput}
                      onChange={handleYearsChange}
                      className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">Yr</span>
                  </div>
                </div>
              </div>

              {yearsWords && (
                <div className="text-xs font-medium text-[var(--calc-accent)] text-right">
                  {yearsWords}
                </div>
              )}
              {yearsError && (
                <p className="text-xs text-red-500 font-medium text-right">{yearsError}</p>
              )}

              {/* Horizontal Range Slider */}
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                autoComplete="off"
                value={Math.min(40, Math.max(0, parsedYears))}
                onChange={(e) => setYearsInput(e.target.value)}
                style={getSliderTrackStyle(yearsPercent)}
                className="financial-slider"
              />
            </div>

          </div>

          {/* Right Column: Visual Summary and Analytics */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between min-h-[360px]">
            <div>
              {/* Output Display Values */}
              <div className="space-y-4">
                {/* Secondary breakdown */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--calc-text-secondary)] font-medium flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-xs shrink-0 bg-[var(--calc-donut-invested)]" />
                    Invested amount
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[var(--calc-text-primary)] tabular-nums">
                    ₹{formatIndianNumber(investedAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--calc-text-secondary)] font-medium flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-xs shrink-0 bg-[var(--calc-donut-returns)]" />
                    Estimated returns
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[var(--calc-accent)] tabular-nums">
                    ₹{formatIndianNumber(Math.round(estimatedReturns))}
                  </span>
                </div>

                {/* Primary Dominant Result */}
                <div className="pt-4 border-t border-[var(--calc-border)] flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--calc-text-primary)] uppercase tracking-wider">
                    Total Value
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[var(--calc-text-primary)] tabular-nums tracking-tight">
                    ₹{formatIndianNumber(totalValue, totalValue > 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Donut Graph — Exact Disjoint Segment Arcs */}
            <div className="mt-6 pt-6 border-t border-[var(--calc-border)] flex items-center justify-between gap-6">
              <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  {/* Underlay base track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="transparent"
                    stroke="var(--calc-track-bg)"
                    strokeWidth="16"
                  />
                  {/* Segment 1: Invested Principal Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="transparent"
                    stroke="var(--calc-donut-invested)"
                    strokeWidth="16"
                    strokeDasharray={`${principalArcLength} ${strokePerimeter}`}
                    strokeDashoffset={0}
                    className="transition-all duration-300 ease-out"
                  />
                  {/* Segment 2: Estimated Returns Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="transparent"
                    stroke="var(--calc-donut-returns)"
                    strokeWidth="16"
                    strokeDasharray={`${interestArcLength} ${strokePerimeter}`}
                    strokeDashoffset={-principalArcLength}
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                {/* Center visual percentage info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-[var(--calc-text-muted)] font-medium uppercase tracking-wider">Returns</span>
                  <span className="text-sm font-extrabold text-[var(--calc-text-primary)] tabular-nums">{Math.round(interestPercentage)}%</span>
                </div>
              </div>

              {/* Legend details — exact 1-to-1 Color Match */}
              <div className="flex-1 space-y-2.5 text-xs font-semibold">
                <div className="flex items-center justify-between text-[var(--calc-text-secondary)]">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-xs shrink-0 bg-[var(--calc-donut-invested)]" />
                    Invested
                  </span>
                  <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">{Math.round(principalPercentage)}%</span>
                </div>
                <div className="flex items-center justify-between text-[var(--calc-text-secondary)]">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-xs shrink-0 bg-[var(--calc-donut-returns)]" />
                    Returns
                  </span>
                  <span className="font-bold text-[var(--calc-accent)] tabular-nums">{Math.round(interestPercentage)}%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Month-on-Month Amortization Schedule with Preview */}
        {schedule.length > 0 && (
          <div className="bg-white dark:bg-[#0a0a0a] border border-[var(--border-subtle)] rounded-xl overflow-hidden mb-8">
            <div className="px-6 py-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
              <span className="uppercase tracking-wider">
                Month-on-Month Amortization Schedule ({schedule.length} Months)
              </span>
              {schedule.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="text-xs font-medium text-[var(--accent-teal)] hover:underline flex items-center gap-1.5 transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={showSchedule}
                >
                  <span>{showSchedule ? "Hide full schedule" : "View full schedule"}</span>
                  {showSchedule ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <div className={showSchedule ? "max-h-[500px] overflow-y-auto" : ""}>
                <table className="financial-table min-w-full">
                  <thead>
                    <tr className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] z-10 text-[11px] font-semibold text-[var(--text-secondary)]">
                      <th className="px-6 py-3 text-left">Period</th>
                      <th className="px-6 py-3 text-right">Investment</th>
                      <th className="px-6 py-3 text-right">Interest Earned</th>
                      <th className="px-6 py-3 text-right">Total Invested</th>
                      <th className="px-6 py-3 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-[var(--border-subtle)] tabular-nums">
                    {(showSchedule ? schedule : schedule.slice(0, 5)).map((row) => (
                      <tr key={row.period} className="hover:bg-[var(--bg-surface)]">
                        <td className="px-6 py-2.5 text-left font-medium text-[var(--text-secondary)]">Month {row.period}</td>
                        <td className="px-6 py-2.5 text-right font-medium">₹{formatIndianNumber(row.deposit)}</td>
                        <td className="px-6 py-2.5 text-right text-[var(--accent-teal)] font-medium">₹{formatIndianNumber(row.interestEarned, true)}</td>
                        <td className="px-6 py-2.5 text-right text-[var(--text-secondary)]">₹{formatIndianNumber(row.totalInvested)}</td>
                        <td className="px-6 py-2.5 text-right font-bold">₹{formatIndianNumber(row.closingBalance, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {schedule.length > 5 && (
              <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center">
                <button
                  type="button"
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--accent-teal)] hover:underline py-1.5 px-4 rounded-md hover:bg-[var(--bg-subtle)] transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={showSchedule}
                >
                  <span>{showSchedule ? "Hide Full Schedule ↑" : `View Full Schedule (${schedule.length} Months) ↓`}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Goal SIP CTA Card */}
        <div className="my-8 p-6 sm:p-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center space-x-2 text-[var(--accent-teal)] font-semibold text-xs uppercase tracking-wider">
              <Target className="h-4 w-4" />
              <span>Plan Your Financial Goal</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-neutral-50">
              Not sure how much you need to invest?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Enter your target goal amount and time period to calculate the monthly, quarterly or yearly SIP you may need to reach your target.
            </p>
          </div>
          <Link
            href="/calculators/goal-sip-calculator"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 space-x-2"
          >
            <span>Calculate Goal SIP</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Calculator Disclaimer */}
        <div className="flex items-start space-x-2.5 p-4 bg-amber-500/5 border border-amber-200/40 dark:border-amber-900/20 rounded-xl mb-12 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Disclaimer:</strong> The results shown by this SIP calculator are illustrative estimates based on the inputs provided and an assumed rate of return. Mutual fund investments are subject to market risks, and actual returns may be higher or lower than the estimate. This calculator is for educational and informational purposes only and should not be considered investment advice.
          </p>
        </div>

        {/* Educational Content & Related Calculators Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border-subtle)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What Is a SIP?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A Systematic Investment Plan (SIP) is a disciplined method of investing a fixed sum of money at regular monthly intervals into mutual funds or equity products. Rather than attempting to time the stock market with a single large deposit, a SIP allows retail investors to build wealth gradually over time.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                Monthly SIP investing leverages two fundamental wealth-creation principles: <strong>compounding</strong> and <strong>rupee-cost averaging</strong>. By investing consistently through market ups and downs, you automatically purchase more mutual fund units when market prices are low and fewer units when prices are high, lowering your average cost per unit over long investment horizons.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What Is a SIP Calculator?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A SIP calculator is an online financial estimation tool that helps you project the potential future value of your recurring monthly investments. By entering three simple inputs — your monthly SIP amount, expected annual return rate, and investment duration — the calculator computes your total out-of-pocket investment, estimated returns earned, and final maturity value.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                Using a SIP return calculator makes goal planning easy. It allows you to simulate how small changes in your monthly contribution or investment period can significantly increase your final portfolio value.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How Does a SIP Calculator Work?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Calculating your estimated SIP maturity value follows a clear, step-by-step process:
              </p>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Input Monthly SIP Amount:</strong> Specify how much capital you plan to invest each month (e.g., ₹10,000).</li>
                <li><strong>Specify Expected Annual Return:</strong> Enter your assumed annual rate of return (e.g., 12% p.a.).</li>
                <li><strong>Set Investment Duration:</strong> Choose how many years you intend to continue the SIP (e.g., 10 years).</li>
                <li><strong>Convert Return Rate:</strong> The calculator converts the annual expected return into an exact monthly compounded rate.</li>
                <li><strong>Apply Future Value Annuity Formula:</strong> Compound interest is calculated month-by-month for each deposit.</li>
                <li><strong>Generate Output Summary:</strong> Display total invested capital, cumulative interest earned, and final estimated maturity value.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">SIP Calculator Formula</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                The potential maturity value of a SIP is computed using the future value of an ordinary annuity formula:
              </p>
              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs text-[var(--accent-teal)] space-y-1.5 mb-3">
                <div className="font-bold text-sm">M = P × [ (1 + r)<sup>n</sup> - 1 ] / r</div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>M (or FV)</strong> = Estimated Maturity Value (Future Value)</div>
                  <div><strong>P</strong> = Monthly SIP investment amount</div>
                  <div><strong>r</strong> = Monthly periodic rate of return</div>
                  <div><strong>n</strong> = Total number of monthly contributions (Years × 12)</div>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                In our implementation, this formula is executed directly by our underlying financial engine (<code className="text-xs bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">calculateSip</code>), maintaining high mathematical precision without formula duplication.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How Is the Monthly SIP Return Rate Calculated?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                An annual return expectation must be converted into an equivalent monthly rate for periodic compounding. This calculator uses the mathematically precise <strong>Effective Annual Rate (EAR)</strong> conversion formula:
              </p>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-center font-mono text-xs text-[var(--accent-teal)] my-3">
                Monthly Rate = (1 + Annual Return)<sup>(1 / 12)</sup> - 1
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                For example, if your expected annual return is <strong>12%</strong> (0.12):
              </p>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg font-mono text-xs text-[var(--text-secondary)] space-y-1 mb-3">
                <div>Monthly Rate = (1 + 0.12)<sup>(1/12)</sup> - 1</div>
                <div>Monthly Rate ≈ 0.0094888 (approx. <strong>0.9489% per month</strong>)</div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                This exact periodic rate compounding ensures that your returns correctly compound to 12% over 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Benefits of Using a SIP Calculator</h2>
              <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
                <li><strong>Goal-Based Wealth Planning:</strong> Calculate how much monthly SIP is needed to buy a home, fund higher education, or build a retirement fund.</li>
                <li><strong>Understanding Compounding Power:</strong> Visualize how extending your investment tenure by a few years multiplies your maturity capital.</li>
                <li><strong>Comparing Scenarios:</strong> Instantly compare how different monthly deposit amounts or return rates impact wealth accumulation.</li>
                <li><strong>Disciplined Investing:</strong> Encourages long-term investment discipline by showing realistic future growth prospects.</li>
                <li><strong>Instant Results:</strong> Replaces manual spreadsheet calculations with immediate, error-free results.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How Much Should I Invest in a SIP?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                There is no universal SIP amount suitable for everyone. Your ideal monthly investment depends on your personal income, essential household expenses, existing debt obligations, emergency funds, and specific financial goals.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                A financial best practice is to follow the 50/30/20 budget rule — allocating at least 20% of your net monthly income toward savings and SIP investments. Start with an affordable amount and systematically increase your monthly SIP as your annual salary grows.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How Long Should I Invest Through SIP?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                SIP investments produce the most dramatic wealth creation when held over long time horizons — ideally 5 to 20 years or longer. In equity mutual funds, short-term horizons (under 3 years) carry higher market volatility risks.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                Over long periods, equity markets tend to trend upward, allowing compound growth to accelerate while rupee-cost averaging neutralizes market downturns.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">SIP vs Lump Sum Investment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border-subtle)] rounded-xl space-y-2">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">SIP (Systematic Investment)</h3>
                  <ul className="space-y-1.5 text-[var(--text-secondary)] list-disc list-inside">
                    <li>Invests fixed monthly amounts regularly.</li>
                    <li>Averages out market entry price (rupee-cost averaging).</li>
                    <li>Ideal for salaried investors with monthly cash inflows.</li>
                    <li>Lower impact from short-term market timing errors.</li>
                  </ul>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border-subtle)] rounded-xl space-y-2">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">Lump Sum Investment</h3>
                  <ul className="space-y-1.5 text-[var(--text-secondary)] list-disc list-inside">
                    <li>Invests entire principal amount at once on day one.</li>
                    <li>Full capital compounds from the initial date.</li>
                    <li>Ideal for investors with sudden capital (bonus, property sale).</li>
                    <li>Higher risk if market drops immediately after investing.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What Affects SIP Returns?</h2>
              <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1.5 list-disc list-inside">
                <li><strong>Monthly Investment Capital:</strong> Larger monthly deposits increase total portfolio value linearly.</li>
                <li><strong>Investment Horizon:</strong> Longer investment durations increase maturity value exponentially due to compounding.</li>
                <li><strong>Asset Allocation:</strong> Equity funds carry higher return potential (10-15%) with higher risk, while debt funds offer lower risk (6-8%).</li>
                <li><strong>Market Cycles & Volatility:</strong> Market trends affect mutual fund NAVs and short-term portfolio valuations.</li>
                <li><strong>Expense Ratios & Fees:</strong> Mutual fund management charges (expense ratio) slightly reduce net actual investor returns.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Key Benefits of SIP Mutual Fund Investing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <h3 className="font-bold text-[var(--text-primary)]">Rupee-Cost Averaging</h3>
                  <p className="text-[var(--text-secondary)]">Automated regular buying eliminates market timing stress and lowers average acquisition cost over volatility cycles.</p>
                </div>
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <h3 className="font-bold text-[var(--text-primary)]">Power of Compounding</h3>
                  <p className="text-[var(--text-secondary)]">Reinvested returns generate exponential portfolio growth over long multi-year investment horizons.</p>
                </div>
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <h3 className="font-bold text-[var(--text-primary)]">Financial Discipline</h3>
                  <p className="text-[var(--text-secondary)]">Auto-debit mandates enforce regular monthly savings commitment directly from your bank account.</p>
                </div>
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <h3 className="font-bold text-[var(--text-primary)]">Flexible Capital</h3>
                  <p className="text-[var(--text-secondary)]">Start with as little as ₹500/month, and pause, increase, or redeem open-ended funds without heavy lock-in penalties.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Important Things to Know About SIP Calculations</h2>
              <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc list-inside">
                <li>SIP calculator outputs are statistical projections based on assumed return rates.</li>
                <li>Mutual fund investments are subject to market risks, and actual returns are not guaranteed.</li>
                <li>Calculations assume a constant rate of return, whereas real market returns vary year to year.</li>
                <li>Taxes (such as LTCG tax on equity funds above ₹1.25 Lakh) and fund expense ratios are not deducted in standard SIP tools.</li>
                <li>You can explore stock fundamentals and market benchmarks using VolumeCall&apos;s research tools like our <Link href="/stocks" className="text-[var(--accent-teal)] font-semibold hover:underline">Stock Screener</Link>, <Link href="/compare" className="text-[var(--accent-teal)] font-semibold hover:underline">Stock Comparison</Link>, and <Link href="/markets" className="text-[var(--accent-teal)] font-semibold hover:underline">Market Indices</Link>.</li>
              </ul>
            </section>

            {/* FAQ Section */}
            <div className="border-t border-[var(--border-subtle)] pt-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqItems.map((faq, idx) => (
                  <div key={idx} className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] transition-colors focus:outline-none"
                      aria-expanded={openFaq === idx}
                    >
                      <span>{faq.q}</span>
                      {openFaq === idx ? <ChevronUp className="h-4 w-4 shrink-0 ml-3" /> : <ChevronDown className="h-4 w-4 shrink-0 ml-3" />}
                    </button>
                    {openFaq === idx && (
                      <div className="px-5 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Related Calculators Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <RelatedCalculators currentRoute="/calculators/sip-calculator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
