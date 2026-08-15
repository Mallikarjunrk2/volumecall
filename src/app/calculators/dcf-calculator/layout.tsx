import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DCF Calculator – Discounted Cash Flow Intrinsic Value Model | VolumeCall",
  description:
    "Free DCF Calculator to calculate intrinsic stock valuation, enterprise value, and fair price per share using Free Cash Flow projections, WACC, and Terminal Value.",
  alternates: {
    canonical: "https://volumecall.in/calculators/dcf-calculator",
  },
  openGraph: {
    title: "DCF Calculator – Discounted Cash Flow Intrinsic Value Model | VolumeCall",
    description:
      "Free DCF Calculator to calculate intrinsic stock valuation, enterprise value, and fair price per share using Free Cash Flow projections, WACC, and Terminal Value.",
    url: "https://volumecall.in/calculators/dcf-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "DCF Calculator – Discounted Cash Flow Intrinsic Value Model | VolumeCall",
    description:
      "Free DCF Calculator to calculate intrinsic stock valuation, enterprise value, and fair price per share using Free Cash Flow projections, WACC, and Terminal Value.",
  },
};

const layoutFaqItems = [
  {
    question: "What is Discounted Cash Flow (DCF) Valuation?",
    answer:
      "Discounted Cash Flow (DCF) is a valuation method that estimates the intrinsic value of an investment or company based on the present value of its expected future Free Cash Flows (FCF).",
  },
  {
    question: "How is Free Cash Flow to Firm (FCFF) calculated?",
    answer:
      "FCFF is calculated as: Operating Cash Flow (or EBIT × (1 - Tax Rate) + Depreciation & Amortization) minus Capital Expenditures (CapEx) minus Changes in Working Capital.",
  },
  {
    question: "What is WACC (Weighted Average Cost of Capital)?",
    answer:
      "WACC represents a company's blended cost of capital across equity and debt, serving as the required discount rate to discount future cash flows back to present value.",
  },
  {
    question: "How is Terminal Value calculated in a DCF model?",
    answer:
      "Terminal Value uses the Gordon Growth Model: Terminal Value = [ Final Year FCF × (1 + g) ] / (WACC - g), where g is the perpetual terminal growth rate (typically 2% to 4% matching long-term GDP).",
  },
  {
    question: "How do you derive Fair Value Per Share from Enterprise Value?",
    answer:
      "Equity Value is derived as: Enterprise Value - Net Debt (Total Debt - Cash & Cash Equivalents). Fair Value per share = Equity Value / Diluted Shares Outstanding.",
  },
  {
    question: "What is Margin of Safety in DCF valuation?",
    answer:
      "Margin of Safety is the discount (e.g. 20% to 30%) an investor demands below the DCF calculated intrinsic value before buying the stock, protecting against estimation errors.",
  },
  {
    question: "Why can Terminal Value make up 60%–80% of total DCF value?",
    answer:
      "Because a company is assumed to operate indefinitely (going concern), the perpetual cash flows beyond the 5–10 year forecast period compound into the majority of present enterprise value.",
  },
  {
    question: "What are the key limitations of DCF valuation?",
    answer:
      "DCF models are highly sensitive to small changes in inputs (such as WACC discount rate and terminal growth rate assumptions), which can dramatically swing the fair value per share.",
  },
  {
    question: "When is DCF valuation not suitable?",
    answer:
      "DCF is unsuitable for early-stage startups with negative cash flows, highly cyclical commodity firms with unpredictable earnings, and financial companies/banks (where cash flows cannot be separated from financing operations).",
  },
  {
    question: "What is the difference between DCF and Reverse DCF?",
    answer:
      "Standard DCF estimates cash flow growth to calculate intrinsic stock price. Reverse DCF takes the current market stock price and solves for the implied growth rate priced in by the market.",
  },
];

export default function DcfLayout({
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
        name: "DCF Calculator",
        item: "https://volumecall.in/calculators/dcf-calculator",
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
