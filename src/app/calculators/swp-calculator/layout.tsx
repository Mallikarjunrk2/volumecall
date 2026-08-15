import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SWP Calculator – Calculate Systematic Withdrawals | VolumeCall",
  description:
    "Calculate monthly mutual fund withdrawals, total income payouts, and remaining corpus longevity for retirement planning. Compare SWP vs FD.",
  alternates: {
    canonical: "https://volumecall.in/calculators/swp-calculator",
  },
  openGraph: {
    title: "SWP Calculator – Calculate Systematic Withdrawals | VolumeCall",
    description:
      "Calculate monthly mutual fund withdrawals, total income payouts, and remaining corpus longevity for retirement planning. Compare SWP vs FD.",
    url: "https://volumecall.in/calculators/swp-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "SWP Calculator – Calculate Systematic Withdrawals | VolumeCall",
    description:
      "Calculate monthly mutual fund withdrawals, total income payouts, and remaining corpus longevity for retirement planning. Compare SWP vs FD.",
  },
};

const layoutFaqItems = [
  {
    question: "What is a Systematic Withdrawal Plan (SWP)?",
    answer:
      "A Systematic Withdrawal Plan (SWP) is a mutual fund facility that allows investors to withdraw a fixed sum of money at regular intervals (usually monthly) while the remaining balance continues to compound and generate returns.",
  },
  {
    question: "How does an SWP calculator work?",
    answer:
      "An SWP calculator simulates month-by-month cash flows: adding monthly investment returns to the opening balance and subtracting your monthly withdrawal to calculate total cash paid out, remaining corpus, and how long the funds will last.",
  },
  {
    question: "Why is SWP better than Fixed Deposit (FD) for monthly income?",
    answer:
      "In an FD, all interest earned is taxed annually at your slab rate (up to 30%+). In an SWP, each withdrawal is treated as a partial redemption of units, so only the capital gain portion is taxed at LTCG rates (12.5% above ₹1.25 Lakh for equity), resulting in far higher post-tax income.",
  },
  {
    question: "Can an SWP corpus run out or get exhausted?",
    answer:
      "Yes. If your withdrawal rate is higher than the rate of return earned by your fund, your capital will gradually decrease until the corpus is exhausted. A sustainable withdrawal rate of 4%–6% per annum is recommended to preserve principal.",
  },
  {
    question: "Can my SWP corpus grow even while withdrawing money?",
    answer:
      "Yes. If your fund generates a higher return (e.g. 10% to 12% p.a.) than your withdrawal rate (e.g. 6% p.a.), your remaining corpus balance can actually increase over time while still providing steady monthly cash flow.",
  },
  {
    question: "Which mutual fund categories are best suited for SWP?",
    answer:
      "Conservative hybrid funds, balanced advantage funds, multi-asset allocation funds, and short-duration debt funds are commonly used for SWP to minimize capital fluctuation while providing steady yields.",
  },
  {
    question: "Can I change my SWP withdrawal amount later?",
    answer:
      "Yes. Investors can increase, decrease, pause, or stop their SWP instructions at any time without penalty through their mutual fund platform.",
  },
  {
    question: "What is the 4% rule in retirement SWP planning?",
    answer:
      "The 4% rule is a widely recognized financial planning guideline suggesting that withdrawing 4% of your initial retirement portfolio in Year 1 (adjusted for inflation) gives a high probability that your corpus will last 30+ years.",
  },
  {
    question: "Are SWP payouts guaranteed?",
    answer:
      "No. Unlike fixed bank deposits, mutual fund returns depend on market performance. During prolonged market downturns, withdrawals can deplete the fund faster if invested in high-volatility assets.",
  },
  {
    question: "How are taxes calculated on SWP withdrawals in India?",
    answer:
      "Each SWP installment redemptions are subject to First-In First-Out (FIFO) taxation rules. For equity mutual funds held over 12 months, capital gains above ₹1.25 Lakh per financial year are taxed at 12.5% LTCG.",
  },
];

export default function SwpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: layoutFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://volumecall.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Calculators",
        item: "https://volumecall.in/calculators",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "SWP Calculator",
        item: "https://volumecall.in/calculators/swp-calculator",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
