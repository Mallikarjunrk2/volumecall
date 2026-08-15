import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FD Calculator – Calculate Fixed Deposit Maturity | VolumeCall",
  description:
    "Calculate cumulative and non-cumulative FD maturity amounts, quarterly compound interest earned, and monthly payouts for Indian bank deposits.",
  alternates: {
    canonical: "https://volumecall.in/calculators/fd-calculator",
  },
  openGraph: {
    title: "FD Calculator – Calculate Fixed Deposit Maturity | VolumeCall",
    description:
      "Calculate cumulative and non-cumulative FD maturity amounts, quarterly compound interest earned, and monthly payouts for Indian bank deposits.",
    url: "https://volumecall.in/calculators/fd-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "FD Calculator – Calculate Fixed Deposit Maturity | VolumeCall",
    description:
      "Calculate cumulative and non-cumulative FD maturity amounts, quarterly compound interest earned, and monthly payouts for Indian bank deposits.",
  },
};

const layoutFaqItems = [
  {
    question: "What is a Fixed Deposit (FD) calculator?",
    answer:
      "An FD calculator is a financial tool that computes the maturity amount and total interest earned on a bank fixed deposit based on deposit amount, interest rate, tenure, and compounding frequency.",
  },
  {
    question: "How is compound interest calculated on bank FDs in India?",
    answer:
      "In India, commercial banks compound FD interest on a quarterly basis (4 times a year). The formula used is A = P × (1 + r/4)^(4 × t), where P is principal, r is nominal annual interest rate, and t is tenure in years.",
  },
  {
    question: "What is the difference between Cumulative and Non-Cumulative FD?",
    answer:
      "In a Cumulative FD, interest is reinvested every quarter and paid out with the principal at maturity, maximizing compound growth. In a Non-Cumulative FD, interest is paid out periodically (monthly, quarterly, or annually) as regular income.",
  },
  {
    question: "Do senior citizens get higher FD interest rates?",
    answer:
      "Yes, Indian banks typically offer 0.50% to 0.75% additional interest per annum to senior citizens (aged 60 and above) across most tenure buckets.",
  },
  {
    question: "How is FD interest taxed in India?",
    answer:
      "FD interest is fully taxable as 'Income from Other Sources' at your applicable income tax slab rate. Banks deduct 10% TDS if interest income exceeds ₹40,000 per year (₹50,000 for senior citizens).",
  },
  {
    question: "Are bank fixed deposits safe?",
    answer:
      "Yes. Bank deposits in all scheduled commercial and cooperative banks in India are insured up to ₹5,00,000 per depositor per bank by the DICGC (Deposit Insurance and Credit Guarantee Corporation, an RBI subsidiary).",
  },
  {
    question: "What happens if I break my FD before maturity?",
    answer:
      "Premature withdrawal of an FD is allowed by most banks, but is subject to a penalty (typically 0.50% to 1.00% lower interest rate than the applicable contracted rate for the period held).",
  },
  {
    question: "What is a 5-Year Tax Saver FD?",
    answer:
      "A Tax Saver FD has a mandatory 5-year lock-in and offers tax deduction under Section 80C up to ₹1.5 Lakh per financial year. Premature withdrawal or loan against tax-saving FDs is not permitted.",
  },
  {
    question: "Can I take a loan against my Fixed Deposit?",
    answer:
      "Yes. Most banks permit loans or overdraft facilities up to 90%–95% of your FD balance at an interest rate typically 1%–2% higher than the FD rate.",
  },
  {
    question: "Which compounding frequency gives higher FD returns?",
    answer:
      "More frequent compounding (e.g. monthly vs quarterly vs annual) yields slightly higher effective returns. In India, quarterly compounding is standard for cumulative bank FDs.",
  },
];

export default function FdLayout({
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
        name: "FD Calculator",
        item: "https://volumecall.in/calculators/fd-calculator",
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
