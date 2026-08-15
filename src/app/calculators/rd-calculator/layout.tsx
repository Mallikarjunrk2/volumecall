import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RD Calculator – Calculate Recurring Deposit Maturity & Interest Online | VolumeCall",
  description:
    "Free Recurring Deposit (RD) Calculator to calculate monthly deposit maturity value and quarterly compound interest for bank and Post Office RDs in India.",
  alternates: {
    canonical: "https://volumecall.in/calculators/rd-calculator",
  },
  openGraph: {
    title: "RD Calculator – Calculate Recurring Deposit Maturity & Interest Online | VolumeCall",
    description:
      "Free Recurring Deposit (RD) Calculator to calculate monthly deposit maturity value and quarterly compound interest for bank and Post Office RDs in India.",
    url: "https://volumecall.in/calculators/rd-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "RD Calculator – Calculate Recurring Deposit Maturity & Interest Online | VolumeCall",
    description:
      "Free Recurring Deposit (RD) Calculator to calculate monthly deposit maturity value and quarterly compound interest for bank and Post Office RDs in India.",
  },
};

const layoutFaqItems = [
  {
    question: "What is a Recurring Deposit (RD)?",
    answer:
      "A Recurring Deposit (RD) is a special term deposit offered by banks and the Post Office in India that allows people to deposit a fixed amount every month for a predetermined period and earn guaranteed interest compounded quarterly.",
  },
  {
    question: "How is RD interest calculated in Indian banks?",
    answer:
      "Indian banks calculate RD interest based on Reserve Bank of India (RBI) guidelines using quarterly compounding. Each monthly installment earns compound interest for the exact number of months remaining until maturity.",
  },
  {
    question: "What is the difference between RD and SIP?",
    answer:
      "In an RD, your capital is deposited into a bank with a fixed, guaranteed interest rate and zero market risk. In a mutual fund SIP, your monthly installment is invested in market-linked equities or bonds with variable returns and higher long-term wealth potential.",
  },
  {
    question: "What is the minimum tenure for a Recurring Deposit?",
    answer:
      "Bank RDs generally have a minimum tenure of 6 months up to a maximum of 10 years (120 months). Post Office RDs have a standard 5-year tenure.",
  },
  {
    question: "Is TDS applicable on RD interest?",
    answer:
      "Yes. Under Section 194A of the Income Tax Act, banks deduct 10% TDS if total interest from RDs and FDs across branches exceeds ₹40,000 per financial year (₹50,000 for senior citizens).",
  },
  {
    question: "Can I miss or skip an RD monthly installment?",
    answer:
      "Skipping an installment incurs a small penalty (typically ₹1 to ₹2 per ₹100 per month). If consecutive installments are missed, the bank may prematurely close the RD account.",
  },
  {
    question: "Can I withdraw money prematurely from an RD?",
    answer:
      "Yes, premature closure of an RD is allowed, subject to a penalty of 0.50% to 1.00% reduction in the applicable interest rate for the period the deposit was maintained.",
  },
  {
    question: "Do senior citizens get preferential rates on RDs?",
    answer:
      "Yes, most Indian banks offer an additional 0.50% to 0.75% per annum on RDs for senior citizens aged 60 and above.",
  },
  {
    question: "Are Post Office RDs different from Bank RDs?",
    answer:
      "Post Office RDs are sovereign-backed with rates fixed quarterly by the Ministry of Finance and feature a mandatory 5-year tenure, whereas bank RDs offer flexible tenures from 6 months to 10 years.",
  },
  {
    question: "Can I take a loan against my Recurring Deposit?",
    answer:
      "Yes, most banks permit loans or overdraft facilities up to 80%–90% of the accumulated RD value at an interest rate 1%–2% above the RD rate.",
  },
];

export default function RdLayout({
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
        name: "RD Calculator",
        item: "https://volumecall.in/calculators/rd-calculator",
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
