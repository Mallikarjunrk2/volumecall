import React from "react";
import {
  Calculator,
  Target,
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  Landmark,
  CalendarDays,
  Home,
  Banknote,
  PiggyBank,
  Percent,
  BarChart3,
  Activity,
  LineChart,
  Flame,
  Sunset,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Coins,
  Search,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

export const CALCULATOR_ICON_MAP: Record<string, LucideIcon> = {
  // Systematic Investing
  "sip-calculator": Calculator,
  "goal-sip-calculator": Target,
  "step-up-sip-calculator": TrendingUp,
  "swp-calculator": Wallet,
  "stp-calculator": ArrowRightLeft,

  // Fixed Income & Banking
  "fd-calculator": Landmark,
  "rd-calculator": CalendarDays,
  "bond-calculator": Landmark,

  // Loans & Debt
  "emi-calculator": Home,
  "loan-amortization-calculator": Banknote,
  "loan-prepayment-calculator": PiggyBank,

  // Returns & Performance
  "cagr-calculator": TrendingUp,
  "absolute-return-calculator": Percent,
  "irr-calculator": BarChart3,
  "xirr-calculator": Activity,
  "time-weighted-return-calculator": LineChart,

  // Planning & Compounding
  "inflation-calculator": Flame,
  "retirement-calculator": Sunset,
  "emergency-fund-calculator": ShieldCheck,
  "compound-interest-calculator": Sparkles,
  "future-value-calculator": ArrowUpRight,
  "present-value-calculator": Coins,

  // Stock Valuation
  "dcf-calculator": LineChart,
  "reverse-dcf-calculator": Search,
  "pe-valuation-calculator": DollarSign,
  "ev-ebitda-calculator": BarChart3,
  "ddm-calculator": Coins,
};

export interface CalculatorIconProps {
  slug?: string;
  name?: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Reusable semantic Lucide Icon component for financial calculators
 */
export function CalculatorIcon({
  slug,
  name,
  className = "h-5 w-5",
  size = 20,
  strokeWidth = 1.8,
  "aria-hidden": ariaHidden = true,
}: CalculatorIconProps) {
  let IconComponent: LucideIcon = Calculator;

  if (slug && CALCULATOR_ICON_MAP[slug]) {
    IconComponent = CALCULATOR_ICON_MAP[slug];
  } else if (name) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const matchedKey = Object.keys(CALCULATOR_ICON_MAP).find((key) =>
      normalized.includes(key.replace("-calculator", ""))
    );
    if (matchedKey) {
      IconComponent = CALCULATOR_ICON_MAP[matchedKey];
    }
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}

export default CalculatorIcon;
