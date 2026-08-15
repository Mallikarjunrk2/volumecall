import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Future Value Calculator – Calculate FV of Investment | VolumeCall",
  description:
    "Calculate the future value (FV) of lump-sum cash deposits and investments based on annual compound growth rates and investment time horizon.",
  alternates: {
    canonical: "https://volumecall.in/calculators/future-value-calculator",
  },
  openGraph: {
    title: "Future Value Calculator – Calculate FV of Investment | VolumeCall",
    description:
      "Calculate the future value (FV) of lump-sum cash deposits and investments based on annual compound growth rates and investment time horizon.",
    url: "https://volumecall.in/calculators/future-value-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Future Value Calculator – Calculate FV of Investment | VolumeCall",
    description:
      "Calculate the future value (FV) of lump-sum cash deposits and investments based on annual compound growth rates and investment time horizon.",
  },
};

const layoutFaqItems = [
  {
    question: "What is Future Value (FV)?",
    answer:
      "Future Value (FV) is the value of a current asset or sum of money at a specified date in the future, based on an assumed rate of growth or rate of return over time.",
  },
  {
    question: "How is Future Value calculated for a lump sum?",
    answer:
      "The formula for Future Value is: FV = PV × (1 + r)^n, where PV is Present Value, r is the interest rate per compounding period, and n is the total number of compounding periods.",
  },
  {
    question: "What is the Time Value of Money (TVM)?",
    answer:
      "The Time Value of Money is the fundamental financial concept that money available at the present time is worth more than the identical sum in the future due to its potential earning capacity.",
  },
  {
    question: "What is the difference between Future Value and Present Value?",
    answer:
      "Future Value compounds a current sum forward into the future. Present Value discounts a future sum backward to determine what it is worth in today's terms.",
  },
  {
    question: "How does inflation affect Future Value?",
    answer:
      "Future Value calculates nominal wealth. If prices rise by 6% annually while your FV grows by 10%, your real purchasing power growth is approximately 3.77% per year (via the Fisher equation).",
  },
  {
    question: "What will ₹5 Lakh be worth in 10 years at 12% annual return?",
    answer:
      "At a 12% compound annual return, an initial lump sum of ₹5,00,000 will grow to approximately ₹15,52,924 in 10 years (a 3.1x growth multiple).",
  },
  {
    question: "Can Future Value be calculated for periodic cash flows?",
    answer:
      "Yes. For periodic recurring deposits, the Future Value of an Ordinary Annuity formula is used (as in our SIP Calculator).",
  },
  {
    question: "How does compounding frequency change Future Value?",
    answer:
      "More frequent compounding (monthly or quarterly instead of annually) yields a slightly higher future value because earned interest is added back to the principal sooner.",
  },
  {
    question: "What is the difference between Future Value and Maturity Value in Bank FDs?",
    answer:
      "They are conceptually the same. Bank FD maturity values represent the future value of the deposit calculated with quarterly compounding.",
  },
  {
    question: "Why is calculating Future Value important in financial planning?",
    answer:
      "It allows investors to verify whether their current lump sum investments will sufficiently fund distant financial milestones like retirement, children's higher education, or buying a house.",
  },
];

export default function FutureValueLayout({
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
        name: "Future Value Calculator",
        item: "https://volumecall.in/calculators/future-value-calculator",
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
