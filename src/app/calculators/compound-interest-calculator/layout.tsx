import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compound Interest Calculator – Calculate Growth | VolumeCall",
  description:
    "Calculate total compound growth, interest on interest, and effective annual rates with daily, monthly, quarterly, or annual compounding frequency.",
  alternates: {
    canonical: "https://volumecall.in/calculators/compound-interest-calculator",
  },
  openGraph: {
    title: "Compound Interest Calculator – Calculate Growth | VolumeCall",
    description:
      "Calculate total compound growth, interest on interest, and effective annual rates with daily, monthly, quarterly, or annual compounding frequency.",
    url: "https://volumecall.in/calculators/compound-interest-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Compound Interest Calculator – Calculate Growth | VolumeCall",
    description:
      "Calculate total compound growth, interest on interest, and effective annual rates with daily, monthly, quarterly, or annual compounding frequency.",
  },
};

const layoutFaqItems = [
  {
    question: "What is Compound Interest?",
    answer:
      "Compound Interest is the addition of interest to the principal sum of a loan or deposit, or in other words, interest on principal plus interest accumulated over previous periods ('interest on interest').",
  },
  {
    question: "How is Compound Interest calculated?",
    answer:
      "The compound interest formula is: A = P × (1 + r / n)^(n × t), where A is Final Amount, P is Principal, r is annual interest rate (decimal), n is compounding frequency per year, and t is tenure in years.",
  },
  {
    question: "What is the difference between Simple Interest and Compound Interest?",
    answer:
      "Simple interest is calculated exclusively on the original principal throughout the term. Compound interest calculates interest on the growing balance (principal + previously earned interest), growing exponentially over time.",
  },
  {
    question: "Which compounding frequency yields the highest return?",
    answer:
      "More frequent compounding (e.g. daily > monthly > quarterly > annual) generates a higher effective annual rate (EAR) because interest is reinvested sooner.",
  },
  {
    question: "What is the Rule of 72 in compound interest?",
    answer:
      "The Rule of 72 is a quick mental math rule to estimate how long it takes an investment to double: Years to Double ≈ 72 / Interest Rate (e.g. 72 / 12% = ~6 years).",
  },
  {
    question: "How does time duration impact compounding?",
    answer:
      "Because compound interest is exponential, the true explosion of wealth occurs in the later years of an investment (the 'hockey stick' curve). Doubling your investment horizon can increase your total returns fourfold or more.",
  },
  {
    question: "What is Effective Annual Rate (EAR)?",
    answer:
      "The Effective Annual Rate (EAR) is the actual annual interest rate earned after taking into account the effects of intra-year compounding (e.g. 10% compounded monthly produces an EAR of 10.47%).",
  },
  {
    question: "Can I add regular monthly deposits to compound interest?",
    answer:
      "Yes. When you add regular periodic monthly deposits to a compounding lump sum, you create an investment annuity (like an SIP), accelerating wealth creation even faster.",
  },
  {
    question: "Does inflation reduce the benefit of compound interest?",
    answer:
      "Yes. Inflation erodes future purchasing power. To calculate real purchasing power growth, evaluate your Real Compound Rate using the Fisher equation.",
  },
  {
    question: "Which financial products in India utilize compound interest?",
    answer:
      "Public Provident Fund (PPF - annual compounding), Bank Fixed Deposits (quarterly compounding), Recurring Deposits (quarterly compounding), and Mutual Funds (daily NAV compounding).",
  },
];

export default function CompoundInterestLayout({
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
        name: "Compound Interest Calculator",
        item: "https://volumecall.in/calculators/compound-interest-calculator",
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
