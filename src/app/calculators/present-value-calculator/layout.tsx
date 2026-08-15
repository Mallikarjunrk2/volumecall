import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Present Value (PV) Calculator – Calculate PV | VolumeCall",
  description:
    "Calculate the present lump-sum amount required today to reach a target future financial sum based on discount rates and time horizon.",
  alternates: {
    canonical: "https://volumecall.in/calculators/present-value-calculator",
  },
  openGraph: {
    title: "Present Value (PV) Calculator – Calculate PV | VolumeCall",
    description:
      "Calculate the present lump-sum amount required today to reach a target future financial sum based on discount rates and time horizon.",
    url: "https://volumecall.in/calculators/present-value-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Present Value (PV) Calculator – Calculate PV | VolumeCall",
    description:
      "Calculate the present lump-sum amount required today to reach a target future financial sum based on discount rates and time horizon.",
  },
};

const layoutFaqItems = [
  {
    question: "What is Present Value (PV)?",
    answer:
      "Present Value (PV) is the current worth of a future sum of money or stream of cash flows given a specified rate of return (discount rate).",
  },
  {
    question: "How is Present Value calculated?",
    answer:
      "The formula for Present Value is: PV = FV / (1 + r)^n, where FV is Future Value, r is the discount rate per period, and n is the number of periods.",
  },
  {
    question: "What is a discount rate?",
    answer:
      "A discount rate represents the opportunity cost of capital or expected annual return you could earn on an alternative investment of similar risk.",
  },
  {
    question: "Why is a rupee today worth more than a rupee tomorrow?",
    answer:
      "Because a rupee in hand today can be invested to earn interest or capital gains, and because inflation erodes future purchasing power.",
  },
  {
    question: "How much do I need to invest today to get ₹1 Crore in 15 years at 12% return?",
    answer:
      "At 12% CAGR, you need to invest a lump sum of approximately ₹18,26,964 today to reach ₹1,00,00,000 (₹1 Crore) in 15 years.",
  },
  {
    question: "What is the relationship between Present Value and Discount Rate?",
    answer:
      "They have an inverse relationship: as the discount rate rises, the present value decreases because money grows faster, requiring less initial capital today.",
  },
  {
    question: "What is the difference between Present Value and Net Present Value (NPV)?",
    answer:
      "Present Value evaluates a single future sum or cash flow. Net Present Value (NPV) subtracts the initial cash investment outlay from the sum of all discounted future cash inflows.",
  },
  {
    question: "Can Present Value be calculated for an annuity stream?",
    answer:
      "Yes. The Present Value of an Annuity formula discounts a regular recurring series of equal payments over time.",
  },
  {
    question: "How is Present Value used in bond valuation?",
    answer:
      "A bond's fair market price is the present value of all its future semi-annual coupon payments plus the present value of its face value paid at maturity, discounted at current market yields.",
  },
  {
    question: "How does inflation affect Present Value calculations?",
    answer:
      "If you wish to calculate purchasing power in today's real terms, you can use the expected inflation rate as your discount rate.",
  },
];

export default function PresentValueLayout({
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
        name: "Present Value Calculator",
        item: "https://volumecall.in/calculators/present-value-calculator",
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
