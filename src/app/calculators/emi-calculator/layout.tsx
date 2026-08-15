import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EMI Calculator – Calculate Home & Personal Loan EMI | VolumeCall",
  description:
    "Calculate monthly loan EMIs, total interest payable, and amortization schedules for home, car, and personal loans using reducing balance rates.",
  alternates: {
    canonical: "https://volumecall.in/calculators/emi-calculator",
  },
  openGraph: {
    title: "EMI Calculator – Calculate Home & Personal Loan EMI | VolumeCall",
    description:
      "Calculate monthly loan EMIs, total interest payable, and amortization schedules for home, car, and personal loans using reducing balance rates.",
    url: "https://volumecall.in/calculators/emi-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "EMI Calculator – Calculate Home & Personal Loan EMI | VolumeCall",
    description:
      "Calculate monthly loan EMIs, total interest payable, and amortization schedules for home, car, and personal loans using reducing balance rates.",
  },
};

const layoutFaqItems = [
  {
    question: "What is an Equated Monthly Installment (EMI)?",
    answer:
      "An Equated Monthly Installment (EMI) is a fixed monthly payment made by a borrower to a bank or lender on a specified date to repay an outstanding loan over a predetermined tenure.",
  },
  {
    question: "How is loan EMI calculated?",
    answer:
      "Loan EMI is calculated using the reducing balance formula: E = P × r × (1 + r)^n / [ (1 + r)^n - 1 ], where P is Principal Loan Amount, r is Monthly Interest Rate (Annual Rate / 12 / 100), and n is Loan Tenure in Months.",
  },
  {
    question: "How does the EMI split between interest and principal work?",
    answer:
      "In the early years of a loan, a major portion of each monthly EMI goes toward paying accrued interest, with a smaller portion reducing the principal. As the principal diminishes over time, the interest component decreases and the principal repayment component increases.",
  },
  {
    question: "What is the difference between Fixed and Floating interest rate loans?",
    answer:
      "A Fixed rate loan maintains the same interest rate and EMI throughout the tenure. A Floating rate loan is linked to a benchmark (like the RBI Repo Rate) where interest rates and EMIs or loan tenures adjust automatically as benchmark rates change.",
  },
  {
    question: "How does increasing loan tenure affect total interest paid?",
    answer:
      "Increasing the loan tenure reduces your monthly EMI, making it easier on your monthly budget, but substantially increases the cumulative interest paid to the bank over the entire loan life.",
  },
  {
    question: "Can I prepay my home loan to reduce EMI or tenure?",
    answer:
      "Yes. According to RBI guidelines, individual borrowers with floating rate home loans face zero prepayment or foreclosure penalties and can make partial prepayments to reduce their tenure or monthly EMI.",
  },
  {
    question: "What is the recommended EMI-to-Income ratio?",
    answer:
      "Financial experts generally recommend keeping total monthly EMI obligations under 40%–50% of your net take-home salary to maintain financial stability and emergency savings.",
  },
  {
    question: "Does taking a longer tenure reduce borrowing risk?",
    answer:
      "A longer tenure provides a safety cushion by keeping monthly mandatory commitments low, but you should actively make periodic prepayments to eliminate the loan early and save on interest.",
  },
  {
    question: "Are processing fees and insurance included in the EMI?",
    answer:
      "Typically, one-time processing fees, documentation charges, and stamp duties are paid upfront at loan sanction, though some lenders offer the option to bundle loan insurance into the EMI.",
  },
  {
    question: "What tax benefits are available on home loan EMIs in India?",
    answer:
      "Under the Old Tax Regime in India, borrowers can claim up to ₹1.5 Lakh per year for principal repayment under Section 80C, and up to ₹2.0 Lakh per year for interest repayment under Section 24(b).",
  },
];

export default function EmiLayout({
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
        name: "EMI Calculator",
        item: "https://volumecall.in/calculators/emi-calculator",
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
