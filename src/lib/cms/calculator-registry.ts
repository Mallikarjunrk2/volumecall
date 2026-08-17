export interface CalculatorRegistryItem {
  id: string;
  name: string;
  category: "Systematic" | "Fixed Income" | "Loans" | "Returns" | "Planning" | "Valuation";
  description: string;
  popular?: boolean;
}

export const ALL_CALCULATORS: CalculatorRegistryItem[] = [
  // ─── 1. Systematic Investing & Wealth Planning ─────────────────────────────
  {
    id: "sip-calculator",
    name: "SIP Calculator",
    category: "Systematic",
    description: "Calculate expected maturity wealth and growth on monthly mutual fund SIP investments.",
    popular: true,
  },
  {
    id: "goal-sip-calculator",
    name: "Goal SIP Calculator",
    category: "Systematic",
    description: "Calculate the exact monthly SIP needed to achieve your target financial goal corpus.",
  },
  {
    id: "step-up-sip-calculator",
    name: "Step-Up SIP Calculator",
    category: "Systematic",
    description: "Calculate wealth multiplier of boosting your SIP by a fixed percentage each year.",
  },
  {
    id: "swp-calculator",
    name: "SWP Calculator",
    category: "Systematic",
    description: "Simulate monthly income withdrawals and remaining corpus lifespan from mutual funds.",
    popular: true,
  },
  {
    id: "stp-calculator",
    name: "STP Calculator",
    category: "Systematic",
    description: "Simulate systematic transfers from liquid/debt funds to equity mutual funds.",
  },

  // ─── 2. Fixed Income & Banking ─────────────────────────────────────────────
  {
    id: "fd-calculator",
    name: "FD Calculator",
    category: "Fixed Income",
    description: "Calculate fixed deposit maturity amount, interest earned, and quarterly compounding.",
    popular: true,
  },
  {
    id: "rd-calculator",
    name: "RD Calculator",
    category: "Fixed Income",
    description: "Calculate recurring deposit maturity values using standard RBI compounding formulas.",
  },
  {
    id: "bond-calculator",
    name: "Bond Calculator",
    category: "Fixed Income",
    description: "Calculate clean price, dirty price, accrued interest, and Yield to Maturity (YTM).",
  },

  // ─── 3. Loans & Debt Acceleration ──────────────────────────────────────────
  {
    id: "emi-calculator",
    name: "EMI Calculator",
    category: "Loans",
    description: "Calculate monthly EMI and total interest payable for home, car, and personal loans.",
    popular: true,
  },
  {
    id: "loan-amortization-calculator",
    name: "Loan Amortization Calculator",
    category: "Loans",
    description: "Generate complete month-by-month and yearly loan principal vs interest payment schedules.",
  },
  {
    id: "loan-prepayment-calculator",
    name: "Loan Prepayment Calculator",
    category: "Loans",
    description: "Calculate interest savings and tenure reduction when making part-prepayments.",
  },

  // ─── 4. Returns & Performance Metrics ──────────────────────────────────────
  {
    id: "cagr-calculator",
    name: "CAGR Calculator",
    category: "Returns",
    description: "Calculate Compound Annual Growth Rate for lump-sum investments.",
    popular: true,
  },
  {
    id: "absolute-return-calculator",
    name: "Absolute Return Calculator",
    category: "Returns",
    description: "Calculate point-to-point percentage capital gain and multiple of money on trades.",
  },
  {
    id: "irr-calculator",
    name: "IRR Calculator",
    category: "Returns",
    description: "Calculate Internal Rate of Return and Net Present Value for regular cash flows.",
  },
  {
    id: "xirr-calculator",
    name: "XIRR Calculator",
    category: "Returns",
    description: "Calculate exact annualized return for irregular cash flow dates and portfolios.",
  },
  {
    id: "time-weighted-return-calculator",
    name: "Time-Weighted Return Calculator",
    category: "Returns",
    description: "Evaluate investment strategy performance across sub-periods neutralizing deposits.",
  },

  // ─── 5. Personal Financial Planning & Compounding ──────────────────────────
  {
    id: "inflation-calculator",
    name: "Inflation Calculator",
    category: "Planning",
    description: "Calculate future inflated cost of living, purchasing power erosion, and real returns.",
  },
  {
    id: "retirement-calculator",
    name: "Retirement Calculator",
    category: "Planning",
    description: "Calculate total retirement corpus required and monthly SIP needed for retirement.",
    popular: true,
  },
  {
    id: "emergency-fund-calculator",
    name: "Emergency Fund Calculator",
    category: "Planning",
    description: "Calculate liquid safety net savings needed to protect against financial crises.",
  },
  {
    id: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    category: "Planning",
    description: "Calculate exponential wealth compounding and effective annual percentage rates.",
  },
  {
    id: "future-value-calculator",
    name: "Future Value Calculator",
    category: "Planning",
    description: "Calculate the future worth of any initial lump sum based on compounding growth rates.",
  },
  {
    id: "present-value-calculator",
    name: "Present Value Calculator",
    category: "Planning",
    description: "Calculate the initial capital required today to reach a target future financial goal.",
  },

  // ─── 6. Stock Valuation & Fundamental Analysis ─────────────────────────────
  {
    id: "dcf-calculator",
    name: "DCF Valuation",
    category: "Valuation",
    description: "Calculate intrinsic equity value and fair share price using Free Cash Flow projections.",
    popular: true,
  },
  {
    id: "reverse-dcf-calculator",
    name: "Reverse DCF Calculator",
    category: "Valuation",
    description: "Reverse-engineer stock prices to find implied 5-year FCF growth expectations.",
  },
  {
    id: "pe-valuation-calculator",
    name: "P/E Valuation Calculator",
    category: "Valuation",
    description: "Calculate target fair stock prices, implied multiples, and PEG ratios based on EPS.",
  },
  {
    id: "ev-ebitda-calculator",
    name: "EV/EBITDA Calculator",
    category: "Valuation",
    description: "Determine Enterprise Value, Equity Value, and fair share price using EBITDA multiples.",
  },
  {
    id: "ddm-calculator",
    name: "DDM Calculator",
    category: "Valuation",
    description: "Estimate fair stock prices for dividend-paying companies using Gordon Growth Model.",
  },
];

export const CALCULATOR_CATEGORIES = [
  "Systematic",
  "Fixed Income",
  "Loans",
  "Returns",
  "Planning",
  "Valuation",
] as const;

export const ALLOWED_CALCULATOR_IDS = new Set(ALL_CALCULATORS.map((c) => c.id));

export function isCalculatorAllowed(id: string): boolean {
  return ALLOWED_CALCULATOR_IDS.has(id.toLowerCase());
}

export function getCalculatorMeta(id: string): CalculatorRegistryItem | undefined {
  return ALL_CALCULATORS.find((c) => c.id.toLowerCase() === id.toLowerCase());
}
