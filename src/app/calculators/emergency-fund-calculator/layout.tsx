import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergency Fund Calculator – Calculate Safety Net & Rainy Day Savings | VolumeCall",
  description:
    "Free Emergency Fund Calculator to calculate how many months of living expenses you need in liquid savings to protect against medical emergencies and job loss in India.",
  alternates: {
    canonical: "https://volumecall.in/calculators/emergency-fund-calculator",
  },
  openGraph: {
    title: "Emergency Fund Calculator – Calculate Safety Net & Rainy Day Savings | VolumeCall",
    description:
      "Free Emergency Fund Calculator to calculate how many months of living expenses you need in liquid savings to protect against medical emergencies and job loss in India.",
    url: "https://volumecall.in/calculators/emergency-fund-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Emergency Fund Calculator – Calculate Safety Net & Rainy Day Savings | VolumeCall",
    description:
      "Free Emergency Fund Calculator to calculate how many months of living expenses you need in liquid savings to protect against medical emergencies and job loss in India.",
  },
};

const layoutFaqItems = [
  {
    question: "What is an Emergency Fund?",
    answer:
      "An Emergency Fund is a dedicated pool of highly liquid cash set aside to cover essential living expenses and unforeseen financial crises such as medical emergencies, job loss, or sudden home repairs.",
  },
  {
    question: "How many months of expenses should I keep in an emergency fund?",
    answer:
      "Financial advisors generally recommend keeping 3 to 6 months of mandatory living expenses for salaried employees with dual-income households, and 9 to 12 months for freelancers, business owners, or single-earner families.",
  },
  {
    question: "Where should I keep my emergency fund in India?",
    answer:
      "Keep your emergency fund divided across high-yield savings accounts, sweep-in bank fixed deposits (FDs), and liquid mutual funds to ensure instant 24/7 liquidity with moderate capital protection.",
  },
  {
    question: "What expenses should be included in the emergency fund calculation?",
    answer:
      "Include only non-negotiable mandatory expenses: rent/home loan EMI, grocery and utility bills, health and life insurance premiums, children's school fees, and essential medicine costs.",
  },
  {
    question: "Should I invest my emergency fund in stocks or equity mutual funds?",
    answer:
      "No. An emergency fund must never be invested in volatile equity markets or real estate because you may be forced to sell units at a severe loss during a market crash.",
  },
  {
    question: "How quickly should an emergency fund be accessible?",
    answer:
      "At least 1 to 2 months of expenses should be instantly withdrawable via ATM or UPI within minutes, with the remainder accessible within 24 to 48 hours via liquid funds or online FD liquidation.",
  },
  {
    question: "What is the difference between an emergency fund and a sinking fund?",
    answer:
      "An emergency fund is for unforeseen crises (e.g. hospital admission, sudden layoff). A sinking fund is for planned future expenses (e.g. annual car insurance renewal, festive travel, home repainting).",
  },
  {
    question: "Should I build an emergency fund before starting stock or SIP investments?",
    answer:
      "Yes. Establishing a minimum 3-month emergency fund is the foundational Step 1 of personal finance. It prevents you from breaking long-term equity SIPs when emergencies occur.",
  },
  {
    question: "How often should I review and update my emergency fund?",
    answer:
      "Review your emergency fund once a year or whenever your monthly expenses change significantly (e.g., getting married, having a baby, taking a new home loan EMI).",
  },
  {
    question: "Can I use a credit card as an emergency fund?",
    answer:
      "Credit cards can be used as a temporary payment bridge for immediate hospital billing, but relying on credit cards as an emergency fund risks high revolving debt (36%–42% p.a. interest).",
  },
];

export default function EmergencyFundLayout({
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
        name: "Emergency Fund Calculator",
        item: "https://volumecall.in/calculators/emergency-fund-calculator",
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
