import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dividend Discount Model (DDM) Calculator – Gordon Growth Stock Valuation | VolumeCall",
  description:
    "Free Dividend Discount Model (DDM) Calculator to estimate the intrinsic value of dividend-paying stocks using the Gordon Growth formula, Cost of Equity (Ke), and dividend growth rate.",
  alternates: {
    canonical: "https://volumecall.in/calculators/ddm-calculator",
  },
  openGraph: {
    title: "Dividend Discount Model (DDM) Calculator – Gordon Growth Stock Valuation | VolumeCall",
    description:
      "Free Dividend Discount Model (DDM) Calculator to estimate the intrinsic value of dividend-paying stocks using the Gordon Growth formula, Cost of Equity (Ke), and dividend growth rate.",
    url: "https://volumecall.in/calculators/ddm-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Dividend Discount Model (DDM) Calculator – Gordon Growth Stock Valuation | VolumeCall",
    description:
      "Free Dividend Discount Model (DDM) Calculator to estimate the intrinsic value of dividend-paying stocks using the Gordon Growth formula, Cost of Equity (Ke), and dividend growth rate.",
  },
};

const layoutFaqItems = [
  {
    question: "What is the Dividend Discount Model (DDM)?",
    answer:
      "The Dividend Discount Model (DDM) is a fundamental valuation method that estimates the fair value of a company's stock by calculating the present value of all its future expected dividend payments.",
  },
  {
    question: "How is the Gordon Growth Model calculated?",
    answer:
      "The Gordon Growth Model formula is: Fair Value = D_1 / (Ke - g), where D_1 is the expected next year dividend [D_0 × (1 + g)], Ke is the Cost of Equity (required rate of return), and g is the constant perpetual dividend growth rate.",
  },
  {
    question: "Why must Cost of Equity (Ke) be greater than Dividend Growth Rate (g)?",
    answer:
      "If growth rate (g) exceeds the cost of equity (Ke), the denominator becomes zero or negative, resulting in a mathematically impossible infinite valuation. In reality, no firm can outgrow the broad economy forever.",
  },
  {
    question: "Which companies are best valued using the Dividend Discount Model?",
    answer:
      "Mature, cash-generative blue-chip companies with established track records of consistent dividend payouts (e.g. PSU utilities, FMCG majors, ITC, REITs, and steady banking leaders).",
  },
  {
    question: "Can DDM be used for companies that do not pay dividends?",
    answer:
      "No. For growth companies or technology firms that reinvest 100% of profits instead of paying dividends, use Discounted Cash Flow (DCF) or P/E Multiple valuation instead.",
  },
  {
    question: "What is the difference between Dividend Yield and Dividend Growth?",
    answer:
      "Dividend yield is the immediate cash return (Annual Dividend / Current Price). Dividend growth is the rate at which the annual rupee dividend payout expands year over year.",
  },
  {
    question: "How is Cost of Equity (Ke) estimated?",
    answer:
      "Ke is typically calculated using the Capital Asset Pricing Model (CAPM): Ke = Risk-Free Rate + Beta × (Equity Risk Premium). In India, Ke for large caps typically ranges between 10% and 13%.",
  },
  {
    question: "How are dividend taxes handled in India?",
    answer:
      "Dividends are added to the investor's total income and taxed at their applicable income tax slab rates, with 10% TDS deducted at source by companies on annual dividend payouts exceeding ₹5,000.",
  },
  {
    question: "What are the limitations of the Gordon Growth Model?",
    answer:
      "The model assumes that dividend growth remains constant in perpetuity, which can be unrealistic over changing economic cycles and competitive disruptions.",
  },
  {
    question: "What is a multi-stage Dividend Discount Model?",
    answer:
      "A multi-stage DDM allows for a high-growth phase (e.g. 15% dividend growth for 5 years) followed by a transition to a stable perpetual growth rate (e.g. 5%), providing greater accuracy for expanding companies.",
  },
];

export default function DdmLayout({
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
        name: "Dividend Discount Model Calculator",
        item: "https://volumecall.in/calculators/ddm-calculator",
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
