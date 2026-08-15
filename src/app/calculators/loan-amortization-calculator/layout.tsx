import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Amortization Calculator – Detailed Monthly Schedule & Payment Breakdown | VolumeCall",
  description:
    "Free Loan Amortization Calculator to generate month-by-month and annual payment schedules with principal, interest, and remaining balance breakdown for Indian loans.",
  alternates: {
    canonical: "https://volumecall.in/calculators/loan-amortization-calculator",
  },
  openGraph: {
    title: "Loan Amortization Calculator – Detailed Monthly Schedule & Payment Breakdown | VolumeCall",
    description:
      "Free Loan Amortization Calculator to generate month-by-month and annual payment schedules with principal, interest, and remaining balance breakdown for Indian loans.",
    url: "https://volumecall.in/calculators/loan-amortization-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Loan Amortization Calculator – Detailed Monthly Schedule & Payment Breakdown | VolumeCall",
    description:
      "Free Loan Amortization Calculator to generate month-by-month and annual payment schedules with principal, interest, and remaining balance breakdown for Indian loans.",
  },
};

const layoutFaqItems = [
  {
    question: "What is a loan amortization schedule?",
    answer:
      "A loan amortization schedule is a complete tabular breakdown of every periodic payment over the life of a loan, detailing the exact amount allocated toward principal reduction, accrued interest, and closing balance.",
  },
  {
    question: "Why is loan interest front-loaded in the early years?",
    answer:
      "Interest is calculated on the outstanding loan balance. In the initial years, the remaining balance is large, so a large portion of your fixed monthly EMI goes toward interest. As the principal drops, monthly interest decreases.",
  },
  {
    question: "How is the monthly interest component calculated in an amortization schedule?",
    answer:
      "For any given month, Monthly Interest = Outstanding Loan Balance × (Annual Interest Rate / 12 / 100). The Principal Repayment component for that month is then equal to Monthly EMI minus Monthly Interest.",
  },
  {
    question: "Can I use an amortization schedule for income tax filing?",
    answer:
      "Yes. Indian home loan borrowers use annual amortization summaries to obtain interest certificates from banks to claim tax deductions under Section 24(b) and Section 80C.",
  },
  {
    question: "How does making early prepayments change the amortization schedule?",
    answer:
      "Any extra prepayment is deducted directly from the outstanding principal balance. This immediately reduces subsequent interest calculations, shortening the total number of amortization months significantly.",
  },
  {
    question: "What is negative amortization?",
    answer:
      "Negative amortization occurs if monthly payments are smaller than the accrued interest, causing the outstanding loan balance to grow over time instead of decreasing. Standard Indian home loans do not feature negative amortization.",
  },
  {
    question: "Does an amortization schedule change if floating interest rates increase?",
    answer:
      "Yes. If the RBI raises benchmark repo rates, banks typically extend the total number of remaining months (tenure) in the amortization schedule while keeping your EMI amount constant.",
  },
  {
    question: "What is the crossover point in loan amortization?",
    answer:
      "The crossover point is the month during the loan tenure where the monthly principal repayment amount surpasses the monthly interest payment amount.",
  },
  {
    question: "How does loan tenure impact total amortization interest?",
    answer:
      "A longer tenure spreads payments across more months, resulting in lower monthly EMIs but a far larger cumulative interest total in the amortization summary.",
  },
  {
    question: "Can I download or print the amortization schedule?",
    answer:
      "Yes, our amortization calculator generates both annual summary tables and detailed month-by-month schedules that can be reviewed or exported.",
  },
];

export default function LoanAmortizationLayout({
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
        name: "Loan Amortization Calculator",
        item: "https://volumecall.in/calculators/loan-amortization-calculator",
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
