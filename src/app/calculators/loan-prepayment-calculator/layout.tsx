import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Prepayment Calculator – Interest Savings | VolumeCall",
  description:
    "Calculate total interest savings, tenure reduction in months, and new reduced EMI amounts when making partial prepayments on home loans.",
  alternates: {
    canonical: "https://volumecall.in/calculators/loan-prepayment-calculator",
  },
  openGraph: {
    title: "Loan Prepayment Calculator – Interest Savings | VolumeCall",
    description:
      "Calculate total interest savings, tenure reduction in months, and new reduced EMI amounts when making partial prepayments on home loans.",
    url: "https://volumecall.in/calculators/loan-prepayment-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Loan Prepayment Calculator – Interest Savings | VolumeCall",
    description:
      "Calculate total interest savings, tenure reduction in months, and new reduced EMI amounts when making partial prepayments on home loans.",
  },
};

const layoutFaqItems = [
  {
    question: "What is loan part-prepayment?",
    answer:
      "Loan part-prepayment refers to paying a lump-sum amount toward your outstanding loan principal before the scheduled tenure ends, over and above your regular monthly EMIs.",
  },
  {
    question: "Is it better to reduce loan tenure or reduce EMI when prepaying?",
    answer:
      "Choosing to reduce loan tenure (while keeping your monthly EMI amount fixed) saves significantly more total interest because you extinguish the remaining debt faster.",
  },
  {
    question: "Are there penalties for home loan prepayment in India?",
    answer:
      "No. As per Reserve Bank of India (RBI) directives, commercial banks and housing finance companies cannot levy any prepayment or foreclosure charges on floating-rate home loans availed by individual borrowers.",
  },
  {
    question: "How does a prepayment save interest?",
    answer:
      "Every rupee you prepay is subtracted directly from the outstanding principal balance. Since interest is calculated monthly on the principal, reducing the principal immediately lowers all future monthly interest charges.",
  },
  {
    question: "When is the best time during loan tenure to make prepayments?",
    answer:
      "Making prepayments early in the loan tenure (during the first 3 to 7 years) yields maximum interest savings because the outstanding loan balance and interest component are at their highest.",
  },
  {
    question: "Can I make multiple prepayments in a year?",
    answer:
      "Yes. Most Indian banks allow borrowers to make multiple part-prepayments throughout the year through online banking or branch visits without restrictions.",
  },
  {
    question: "What is the 1-extra-EMI-per-year strategy?",
    answer:
      "Paying just 1 additional EMI every calendar year toward your principal can reduce a standard 20-year home loan tenure by approximately 3 to 4 years and save lakhs in interest.",
  },
  {
    question: "How does loan prepayment impact tax deductions under Section 24(b)?",
    answer:
      "While reducing total interest paid lowers your future interest tax deduction under Section 24(b), the guaranteed interest savings (e.g. 8.5% tax-free) far outweigh any tax benefit.",
  },
  {
    question: "Can I prepay fixed-rate loans without penalty?",
    answer:
      "For fixed-rate personal, auto, or business loans, lenders may levy a prepayment penalty of 2% to 5% plus GST on the prepaid amount.",
  },
  {
    question: "Does prepayment improve my credit score (CIBIL)?",
    answer:
      "Yes. Prepaying debt reduces your overall credit utilization and debt-to-income ratio, which positively impacts your CIBIL score.",
  },
];

export default function LoanPrepaymentLayout({
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
        name: "Loan Prepayment Calculator",
        item: "https://volumecall.in/calculators/loan-prepayment-calculator",
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
