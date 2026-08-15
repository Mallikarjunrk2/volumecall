import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV/EBITDA Calculator – Enterprise Value Model | VolumeCall",
  description:
    "Determine Enterprise Value (EV), Equity Value, and target fair share price using operating EBITDA multiples and company Net Debt.",
  alternates: {
    canonical: "https://volumecall.in/calculators/ev-ebitda-calculator",
  },
  openGraph: {
    title: "EV/EBITDA Calculator – Enterprise Value Model | VolumeCall",
    description:
      "Determine Enterprise Value (EV), Equity Value, and target fair share price using operating EBITDA multiples and company Net Debt.",
    url: "https://volumecall.in/calculators/ev-ebitda-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "EV/EBITDA Calculator – Enterprise Value Model | VolumeCall",
    description:
      "Determine Enterprise Value (EV), Equity Value, and target fair share price using operating EBITDA multiples and company Net Debt.",
  },
};

const layoutFaqItems = [
  {
    question: "What is EV/EBITDA?",
    answer:
      "EV/EBITDA (Enterprise Multiple) compares a company's Enterprise Value (market value of equity plus debt minus cash) to its annual Earnings Before Interest, Taxes, Depreciation, and Amortization (EBITDA).",
  },
  {
    question: "Why is EV/EBITDA preferred over P/E for capital-intensive companies?",
    answer:
      "EV/EBITDA is capital-structure-neutral and unaffected by differing depreciation policies or debt levels, making it the ideal valuation multiple for comparing companies across manufacturing, telecom, power, and infrastructure.",
  },
  {
    question: "How is Enterprise Value (EV) calculated?",
    answer:
      "Enterprise Value = Market Capitalization + Total Debt + Minority Interest + Preferred Stock - Cash & Cash Equivalents.",
  },
  {
    question: "How do you derive Fair Value Per Share from EV/EBITDA?",
    answer:
      "First calculate Enterprise Value = EBITDA × Target Multiple. Then derive Equity Value = Enterprise Value - Net Debt. Finally, Fair Value per share = Equity Value / Shares Outstanding.",
  },
  {
    question: "What is considered a 'good' or fair EV/EBITDA multiple in India?",
    answer:
      "A multiple below 8x–10x is often considered attractive for industrial/commodity companies, while high-margin growth sectors (consumer tech, branded retail, pharma) trade between 15x and 25x EV/EBITDA.",
  },
  {
    question: "How does Net Debt impact Equity Value in an EV/EBITDA valuation?",
    answer:
      "High net debt directly reduces equity value for shareholders. For a net-cash company (cash > debt), net debt is negative, which increases equity value above enterprise value.",
  },
  {
    question: "What is the difference between EBITDA and Operating Cash Flow?",
    answer:
      "EBITDA does not account for changes in working capital (inventories, receivables) or taxes paid, whereas Operating Cash Flow (OCF) reflects actual cash collected.",
  },
  {
    question: "Can EV/EBITDA be negative?",
    answer:
      "If a company suffers operating losses (negative EBITDA), the EV/EBITDA multiple is negative and cannot be meaningfully interpreted.",
  },
  {
    question: "Why is EV/EBITDA commonly used in Mergers & Acquisitions (M&A)?",
    answer:
      "Acquirers must buy out both equity holders and assume debt obligations. EV/EBITDA reveals the total acquisition price required relative to the target's operating cash generation.",
  },
  {
    question: "Can EV/EBITDA be used for banks and financial institutions?",
    answer:
      "No. For banks and NBFCs, interest is their primary operating cost and debt is their raw material inventory, making EBITDA and Enterprise Value inapplicable. Price-to-Book (P/B) is used instead.",
  },
];

export default function EvEbitdaLayout({
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
        name: "EV/EBITDA Calculator",
        item: "https://volumecall.in/calculators/ev-ebitda-calculator",
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
