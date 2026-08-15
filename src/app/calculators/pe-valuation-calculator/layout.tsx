import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "P/E Valuation & PEG Calculator – Calculate Fair Stock Price | VolumeCall",
  description:
    "Free P/E Ratio & PEG Ratio Valuation Calculator to determine target fair stock prices based on forward EPS, historical sector P/E multiples, and earnings growth.",
  alternates: {
    canonical: "https://volumecall.in/calculators/pe-valuation-calculator",
  },
  openGraph: {
    title: "P/E Valuation & PEG Calculator – Calculate Fair Stock Price | VolumeCall",
    description:
      "Free P/E Ratio & PEG Ratio Valuation Calculator to determine target fair stock prices based on forward EPS, historical sector P/E multiples, and earnings growth.",
    url: "https://volumecall.in/calculators/pe-valuation-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "P/E Valuation & PEG Calculator – Calculate Fair Stock Price | VolumeCall",
    description:
      "Free P/E Ratio & PEG Ratio Valuation Calculator to determine target fair stock prices based on forward EPS, historical sector P/E multiples, and earnings growth.",
  },
};

const layoutFaqItems = [
  {
    question: "What is the Price-to-Earnings (P/E) Ratio?",
    answer:
      "The P/E ratio measures a company's current share price relative to its per-share earnings (EPS). It indicates how many rupees investors are willing to pay for one rupee of company profit.",
  },
  {
    question: "How is Fair Stock Value calculated using the P/E multiple?",
    answer:
      "The formula is: Target Fair Value = Expected Forward EPS × Target Fair P/E Multiple.",
  },
  {
    question: "What is the PEG (Price/Earnings-to-Growth) Ratio?",
    answer:
      "The PEG ratio refines the P/E ratio by factoring in earnings growth: PEG = P/E Ratio / Annual EPS Growth Rate (%). A PEG below 1.0 is traditionally considered undervalued (GARP - Growth at a Reasonable Price).",
  },
  {
    question: "What is the difference between Trailing P/E and Forward P/E?",
    answer:
      "Trailing P/E uses past 12-month historical reported EPS. Forward P/E uses estimated projected EPS for the upcoming fiscal year, reflecting future earning power.",
  },
  {
    question: "Why do different sectors trade at vastly different P/E multiples in India?",
    answer:
      "Sectors with high return on capital (ROCE), high reinvestment runways, and steady earnings (like FMCG and IT) command 40x–60x P/E, while cyclical capital-intensive sectors (like metals and power) trade at 8x–15x P/E.",
  },
  {
    question: "Can P/E valuation be used for loss-making companies?",
    answer:
      "No. When a company has negative net income (EPS < 0), the P/E ratio is undefined or meaningless. Use Price-to-Sales (P/S) or EV/EBITDA instead.",
  },
  {
    question: "How should I choose a 'Fair P/E' for a company?",
    answer:
      "Use the stock's 5-year or 10-year historical median P/E multiple, or compare it against top industry peer averages adjusted for growth differences.",
  },
  {
    question: "What are the pitfalls of relying solely on P/E ratios?",
    answer:
      "P/E ratios can be artificially distorted by one-time exceptional gains, aggressive accounting, cyclical earnings peaks (the 'value trap'), or high debt levels.",
  },
  {
    question: "What is Peter Lynch's Fair Value Formula?",
    answer:
      "Legendary investor Peter Lynch stated that a fairly valued company typically has a P/E multiple equal to its long-term sustainable percentage earnings growth rate (PEG = 1.0).",
  },
  {
    question: "How does interest rate environment affect market P/E multiples?",
    answer:
      "When central banks raise interest rates, fixed income yields rise, causing equity discount rates to rise and stock market P/E multiples to contract (compress).",
  },
];

export default function PeValuationLayout({
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
        name: "P/E Valuation Calculator",
        item: "https://volumecall.in/calculators/pe-valuation-calculator",
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
