import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Step-Up SIP Calculator – Calculate Top-Up SIP Growth Online | VolumeCall",
  description:
    "Free Step-Up SIP Calculator to estimate wealth creation when increasing your monthly mutual fund SIP annually by percentage or fixed amount. Compare Step-Up vs Regular SIP.",
  alternates: {
    canonical: "https://volumecall.in/calculators/step-up-sip-calculator",
  },
  openGraph: {
    title: "Step-Up SIP Calculator – Calculate Top-Up SIP Growth Online | VolumeCall",
    description:
      "Free Step-Up SIP Calculator to estimate wealth creation when increasing your monthly mutual fund SIP annually by percentage or fixed amount. Compare Step-Up vs Regular SIP.",
    url: "https://volumecall.in/calculators/step-up-sip-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Step-Up SIP Calculator – Calculate Top-Up SIP Growth Online | VolumeCall",
    description:
      "Free Step-Up SIP Calculator to estimate wealth creation when increasing your monthly mutual fund SIP annually by percentage or fixed amount. Compare Step-Up vs Regular SIP.",
  },
};

const layoutFaqItems = [
  {
    question: "What is a Step-Up SIP (Top-Up SIP)?",
    answer:
      "A Step-Up SIP (also called a Top-Up SIP) is an automated mutual fund feature that increases your monthly investment contribution by a fixed percentage (e.g. 10%) or fixed rupee amount every year, aligning your investments with annual salary appraisals.",
  },
  {
    question: "How does a Step-Up SIP calculator work?",
    answer:
      "A Step-Up SIP calculator simulates month-by-month compounding where your monthly installment increases at the start of every 12-month cycle. It computes the total capital invested, estimated compound returns, and final maturity corpus.",
  },
  {
    question: "How is Step-Up SIP different from a regular SIP?",
    answer:
      "A regular SIP keeps your monthly deposit constant throughout the tenure (e.g. ₹10,000/month for 15 years). A Step-Up SIP increases the monthly deposit each year (e.g. ₹10,000 in Year 1, ₹11,000 in Year 2, ₹12,100 in Year 3), resulting in a significantly larger final corpus.",
  },
  {
    question: "What is the recommended annual step-up percentage?",
    answer:
      "A 10% annual step-up is widely recommended by financial advisors in India. It matches typical corporate salary appraisal rates and ensures that inflation does not erode your savings rate.",
  },
  {
    question: "How does stepping up my SIP help beat inflation?",
    answer:
      "As the cost of living rises each year, a flat SIP contribution effectively represents a smaller proportion of your real income. Increasing your SIP annually ensures your savings rate keeps pace with or exceeds inflation.",
  },
  {
    question: "Can I choose a fixed rupee increase instead of a percentage?",
    answer:
      "Yes, most Indian mutual fund platforms allow you to choose either a percentage increase (e.g., 10% or 15%) or a fixed rupee increase (e.g., ₹1,000 or ₹2,000 extra per month each year).",
  },
  {
    question: "Does stepping up an SIP double the returns?",
    answer:
      "Over long tenures (15–20 years), a 10% annual step-up can nearly double your final wealth compared to a flat SIP, because higher contributions in later years compound upon a substantial existing portfolio base.",
  },
  {
    question: "Can I stop or modify the step-up feature later?",
    answer:
      "Yes, mutual fund houses allow investors to pause, modify, or cancel the automated top-up instruction without stopping the underlying monthly SIP.",
  },
  {
    question: "Are Step-Up SIP return estimates guaranteed?",
    answer:
      "No, all calculations are illustrative projections based on an assumed constant annual return rate. Mutual fund returns fluctuate based on market movements and are subject to market risks.",
  },
  {
    question: "Are taxes deducted from Step-Up SIP calculator results?",
    answer:
      "No, calculator results show gross pre-tax estimated wealth. In India, equity mutual fund capital gains above ₹1.25 Lakh per financial year are taxed under Long-Term Capital Gains (LTCG) at 12.5%.",
  },
];

export default function StepUpSipLayout({
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
        name: "Step-Up SIP Calculator",
        item: "https://volumecall.in/calculators/step-up-sip-calculator",
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
