import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAGR Calculator – Calculate Compound Annual Growth Rate Online | VolumeCall",
  description:
    "Free CAGR Calculator to calculate Compound Annual Growth Rate for investments in stocks, mutual funds, real estate, and gold over multi-year periods.",
  alternates: {
    canonical: "https://volumecall.in/calculators/cagr-calculator",
  },
  openGraph: {
    title: "CAGR Calculator – Calculate Compound Annual Growth Rate Online | VolumeCall",
    description:
      "Free CAGR Calculator to calculate Compound Annual Growth Rate for investments in stocks, mutual funds, real estate, and gold over multi-year periods.",
    url: "https://volumecall.in/calculators/cagr-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "CAGR Calculator – Calculate Compound Annual Growth Rate Online | VolumeCall",
    description:
      "Free CAGR Calculator to calculate Compound Annual Growth Rate for investments in stocks, mutual funds, real estate, and gold over multi-year periods.",
  },
};

const layoutFaqItems = [
  {
    question: "What is Compound Annual Growth Rate (CAGR)?",
    answer:
      "Compound Annual Growth Rate (CAGR) represents the annualized constant rate of return required for an investment to grow from its beginning initial balance to its ending final balance over a specified number of years.",
  },
  {
    question: "How is CAGR calculated?",
    answer:
      "CAGR is calculated using the formula: CAGR = (Final Value / Initial Value)^(1 / Years) - 1. It geometric-averages annual returns over time, smoothing out market fluctuations.",
  },
  {
    question: "When should I use CAGR instead of Absolute Return?",
    answer:
      "Use CAGR whenever evaluating investments held for longer than one year. Absolute return ignores the time horizon, whereas CAGR annualizes growth to allow direct apples-to-apples comparisons.",
  },
  {
    question: "Can CAGR be negative?",
    answer:
      "Yes. If the final value of an investment is lower than its initial purchase price, the CAGR will be negative, reflecting an annualized loss.",
  },
  {
    question: "Can I use CAGR for SIP investments?",
    answer:
      "No. CAGR is designed exclusively for one-time lump sum investments. For recurring or periodic investments like SIPs with multiple cash flows, use XIRR (Extended Internal Rate of Return) instead.",
  },
  {
    question: "What is considered a good CAGR for equity mutual funds in India?",
    answer:
      "Historically, broad Indian equity indices (such as the Nifty 50 and BSE Sensex) and diversified equity mutual funds have delivered long-term CAGRs between 12% and 15% over 10+ year horizons.",
  },
  {
    question: "Does CAGR reflect actual year-by-year volatility?",
    answer:
      "No. CAGR provides an imaginary smoothed annual rate. It does not reveal whether the investment experienced sharp market drawdowns or sudden surges during intermediate years.",
  },
  {
    question: "How does inflation affect my CAGR?",
    answer:
      "CAGR measures nominal return. To determine your Real CAGR (purchasing power growth), subtract the average annual inflation rate from your nominal CAGR using the Fisher equation.",
  },
  {
    question: "Is CAGR the same as IRR?",
    answer:
      "For a single initial cash outflow followed by a single final cash inflow at maturity, CAGR and IRR are mathematically identical. For multiple cash flows at irregular intervals, IRR/XIRR must be used.",
  },
  {
    question: "What is the Rule of 72 in relation to CAGR?",
    answer:
      "The Rule of 72 is a quick estimation shortcut: dividing 72 by the CAGR gives the approximate number of years required for your investment capital to double (e.g. 72 / 12% CAGR ≈ 6 years).",
  },
];

export default function CagrLayout({
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
        name: "CAGR Calculator",
        item: "https://volumecall.in/calculators/cagr-calculator",
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
