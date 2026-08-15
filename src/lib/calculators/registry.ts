export interface CalculatorMeta {
  slug: string;
  name: string;
  shortDescription: string;
  category: "investment" | "fixedIncome" | "loans" | "returns" | "planning" | "compounding" | "valuation";
  categoryLabel: string;
  href: string;
  iconName: string;
}

export const CALCULATORS_REGISTRY: CalculatorMeta[] = [
  // Investment Calculators
  {
    slug: "sip-calculator",
    name: "SIP Calculator",
    shortDescription: "Calculate estimated maturity returns on regular monthly mutual fund investments.",
    category: "investment",
    categoryLabel: "Investment & Wealth",
    href: "/calculators/sip-calculator",
    iconName: "Calculator",
  },
  {
    slug: "goal-sip-calculator",
    name: "Goal SIP Calculator",
    shortDescription: "Calculate the required monthly, quarterly, or annual SIP to reach a target goal corpus.",
    category: "investment",
    categoryLabel: "Investment & Wealth",
    href: "/calculators/goal-sip-calculator",
    iconName: "Target",
  },
  {
    slug: "step-up-sip-calculator",
    name: "Step-Up SIP Calculator",
    shortDescription: "Estimate wealth growth when increasing your monthly SIP amount annually by % or fixed amount.",
    category: "investment",
    categoryLabel: "Investment & Wealth",
    href: "/calculators/step-up-sip-calculator",
    iconName: "TrendingUp",
  },
  {
    slug: "swp-calculator",
    name: "SWP Calculator",
    shortDescription: "Estimate regular monthly withdrawals from a mutual fund corpus and remaining longevity.",
    category: "investment",
    categoryLabel: "Investment & Wealth",
    href: "/calculators/swp-calculator",
    iconName: "ArrowDownRight",
  },
  {
    slug: "stp-calculator",
    name: "STP Calculator",
    shortDescription: "Calculate systematic fund transfers from one mutual fund scheme to another over time.",
    category: "investment",
    categoryLabel: "Investment & Wealth",
    href: "/calculators/stp-calculator",
    iconName: "ArrowRightLeft",
  },

  // Fixed Income Calculators
  {
    slug: "fd-calculator",
    name: "FD Calculator",
    shortDescription: "Calculate Fixed Deposit maturity amount, interest earned, or periodic payout.",
    category: "fixedIncome",
    categoryLabel: "Fixed Income & Savings",
    href: "/calculators/fd-calculator",
    iconName: "Building2",
  },
  {
    slug: "rd-calculator",
    name: "RD Calculator",
    shortDescription: "Calculate Recurring Deposit maturity value and compound interest on monthly installments.",
    category: "fixedIncome",
    categoryLabel: "Fixed Income & Savings",
    href: "/calculators/rd-calculator",
    iconName: "Clock",
  },
  {
    slug: "bond-calculator",
    name: "Bond Calculator",
    shortDescription: "Calculate bond price, coupon payments, and Yield to Maturity (YTM).",
    category: "fixedIncome",
    categoryLabel: "Fixed Income & Savings",
    href: "/calculators/bond-calculator",
    iconName: "Landmark",
  },

  // Loan Calculators
  {
    slug: "emi-calculator",
    name: "EMI Calculator",
    shortDescription: "Calculate monthly EMI, total interest, and total payment for home, car, or personal loans.",
    category: "loans",
    categoryLabel: "Loans & Borrowing",
    href: "/calculators/emi-calculator",
    iconName: "CreditCard",
  },
  {
    slug: "loan-amortization-calculator",
    name: "Loan Amortization Calculator",
    shortDescription: "Generate a complete month-by-month principal and interest loan breakdown schedule.",
    category: "loans",
    categoryLabel: "Loans & Borrowing",
    href: "/calculators/loan-amortization-calculator",
    iconName: "Table",
  },
  {
    slug: "loan-prepayment-calculator",
    name: "Loan Prepayment Calculator",
    shortDescription: "Calculate interest savings and tenure or EMI reduction by making partial loan prepayments.",
    category: "loans",
    categoryLabel: "Loans & Borrowing",
    href: "/calculators/loan-prepayment-calculator",
    iconName: "PiggyBank",
  },

  // Return Calculators
  {
    slug: "absolute-return-calculator",
    name: "Absolute Return Calculator",
    shortDescription: "Calculate total percentage return on investment regardless of time horizon.",
    category: "returns",
    categoryLabel: "Performance & Returns",
    href: "/calculators/absolute-return-calculator",
    iconName: "Percent",
  },
  {
    slug: "cagr-calculator",
    name: "CAGR Calculator",
    shortDescription: "Calculate Compound Annual Growth Rate for lump sum investments over time.",
    category: "returns",
    categoryLabel: "Performance & Returns",
    href: "/calculators/cagr-calculator",
    iconName: "BarChart3",
  },
  {
    slug: "irr-calculator",
    name: "IRR Calculator",
    shortDescription: "Calculate Internal Rate of Return for periodic cash flow series.",
    category: "returns",
    categoryLabel: "Performance & Returns",
    href: "/calculators/irr-calculator",
    iconName: "LineChart",
  },
  {
    slug: "xirr-calculator",
    name: "XIRR Calculator",
    shortDescription: "Calculate Extended Internal Rate of Return for irregular cash flows with exact dates.",
    category: "returns",
    categoryLabel: "Performance & Returns",
    href: "/calculators/xirr-calculator",
    iconName: "Calendar",
  },
  {
    slug: "time-weighted-return-calculator",
    name: "Time-Weighted Return Calculator",
    shortDescription: "Calculate Time-Weighted Rate of Return (TWR) neutralizing external cash flow impacts.",
    category: "returns",
    categoryLabel: "Performance & Returns",
    href: "/calculators/time-weighted-return-calculator",
    iconName: "Activity",
  },

  // Planning Calculators
  {
    slug: "inflation-calculator",
    name: "Inflation Calculator",
    shortDescription: "Estimate future cost of living, purchasing power decline, and Fisher exact real returns.",
    category: "planning",
    categoryLabel: "Financial Planning",
    href: "/calculators/inflation-calculator",
    iconName: "Flame",
  },
  {
    slug: "retirement-calculator",
    name: "Retirement Calculator",
    shortDescription: "Estimate target retirement corpus, post-retirement monthly expenses, and monthly SIP needed.",
    category: "planning",
    categoryLabel: "Financial Planning",
    href: "/calculators/retirement-calculator",
    iconName: "Palmtree",
  },
  {
    slug: "emergency-fund-calculator",
    name: "Emergency Fund Calculator",
    shortDescription: "Calculate recommended liquid emergency reserve based on essential monthly expenses.",
    category: "planning",
    categoryLabel: "Financial Planning",
    href: "/calculators/emergency-fund-calculator",
    iconName: "ShieldAlert",
  },

  // Compounding / Time Value Calculators
  {
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    shortDescription: "Calculate compound interest growth with annual, semi-annual, quarterly, or monthly compounding.",
    category: "compounding",
    categoryLabel: "Time Value of Money",
    href: "/calculators/compound-interest-calculator",
    iconName: "Sparkles",
  },
  {
    slug: "future-value-calculator",
    name: "Future Value Calculator",
    shortDescription: "Calculate future value of a single present investment compounding at a fixed interest rate.",
    category: "compounding",
    categoryLabel: "Time Value of Money",
    href: "/calculators/future-value-calculator",
    iconName: "ArrowUpRight",
  },
  {
    slug: "present-value-calculator",
    name: "Present Value Calculator",
    shortDescription: "Calculate current discounted present value of a future cash sum.",
    category: "compounding",
    categoryLabel: "Time Value of Money",
    href: "/calculators/present-value-calculator",
    iconName: "Coins",
  },

  // Valuation Calculators
  {
    slug: "dcf-calculator",
    name: "DCF Calculator",
    shortDescription: "Estimate equity fair value per share using Discounted Cash Flow (DCF) model.",
    category: "valuation",
    categoryLabel: "Equity Valuation",
    href: "/calculators/dcf-calculator",
    iconName: "BadgeIndianRupee",
  },
  {
    slug: "reverse-dcf-calculator",
    name: "Reverse DCF Calculator",
    shortDescription: "Calculate implied FCF growth rate baked into a stock's current market price.",
    category: "valuation",
    categoryLabel: "Equity Valuation",
    href: "/calculators/reverse-dcf-calculator",
    iconName: "Compass",
  },
  {
    slug: "pe-valuation-calculator",
    name: "P/E Valuation Calculator",
    shortDescription: "Calculate fair share price based on target P/E multiple, EPS, and PEG ratio.",
    category: "valuation",
    categoryLabel: "Equity Valuation",
    href: "/calculators/pe-valuation-calculator",
    iconName: "PieChart",
  },
  {
    slug: "ev-ebitda-calculator",
    name: "EV/EBITDA Calculator",
    shortDescription: "Calculate Enterprise Value and fair equity value per share using EV/EBITDA multiple.",
    category: "valuation",
    categoryLabel: "Equity Valuation",
    href: "/calculators/ev-ebitda-calculator",
    iconName: "Layers",
  },
  {
    slug: "ddm-calculator",
    name: "Dividend Discount Model Calculator",
    shortDescription: "Estimate stock intrinsic value using Gordon Growth Dividend Discount Model (DDM).",
    category: "valuation",
    categoryLabel: "Equity Valuation",
    href: "/calculators/ddm-calculator",
    iconName: "Gift",
  },
];

export function getCalculatorsByCategory(category: CalculatorMeta["category"]) {
  return CALCULATORS_REGISTRY.filter((c) => c.category === category);
}

export function getCalculatorBySlug(slug: string) {
  return CALCULATORS_REGISTRY.find((c) => c.slug === slug);
}
