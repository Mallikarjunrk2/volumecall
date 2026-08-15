import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inflation Calculator – Calculate Future Cost & Purchasing Power in India | VolumeCall",
  description:
    "Free Inflation Calculator to calculate future cost of living, purchasing power erosion, and real inflation-adjusted returns using the Fisher equation.",
  alternates: {
    canonical: "https://volumecall.in/calculators/inflation-calculator",
  },
  openGraph: {
    title: "Inflation Calculator – Calculate Future Cost & Purchasing Power in India | VolumeCall",
    description:
      "Free Inflation Calculator to calculate future cost of living, purchasing power erosion, and real inflation-adjusted returns using the Fisher equation.",
    url: "https://volumecall.in/calculators/inflation-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Inflation Calculator – Calculate Future Cost & Purchasing Power in India | VolumeCall",
    description:
      "Free Inflation Calculator to calculate future cost of living, purchasing power erosion, and real inflation-adjusted returns using the Fisher equation.",
  },
};

const layoutFaqItems = [
  {
    question: "What is inflation?",
    answer:
      "Inflation is the rate at which the general level of prices for goods and services rises over time, resulting in a continuous decrease in the purchasing power of money.",
  },
  {
    question: "How does inflation affect long-term savings and investments?",
    answer:
      "Inflation erodes the future purchasing power of your money. If your investment earns 6% interest while inflation is 6%, your real wealth growth is zero.",
  },
  {
    question: "What is the historical average inflation rate in India?",
    answer:
      "Over the past two decades, consumer price inflation (CPI) in India has averaged approximately 5.5% to 6.5% per annum, while lifestyle inflation (education and healthcare) has averaged 8% to 10% p.a.",
  },
  {
    question: "What is the Fisher Equation for Real Return?",
    answer:
      "The exact Fisher equation calculates real purchasing power growth as: Real Return = (1 + Nominal Return) / (1 + Inflation Rate) - 1.",
  },
  {
    question: "Why shouldn't I just subtract inflation from nominal return?",
    answer:
      "Simply subtracting (Nominal - Inflation) is an approximation that becomes increasingly inaccurate over higher inflation rates and multi-year compounding. The Fisher formula gives exact mathematical precision.",
  },
  {
    question: "What will ₹1 Lakh today be worth in 15 years at 6% inflation?",
    answer:
      "At 6% annual inflation, you will need approximately ₹2,39,656 in 15 years to purchase what ₹1,00,000 buys today. Conversely, ₹1 Lakh saved under a mattress will only have the purchasing power of ~₹41,727.",
  },
  {
    question: "Which asset classes historically beat inflation in India?",
    answer:
      "Equities (mutual funds/stocks), real estate, and physical gold have historically delivered long-term returns well in excess of retail inflation.",
  },
  {
    question: "What is education and healthcare inflation in India?",
    answer:
      "Higher education and private hospital healthcare in India experience inflation rates of 8% to 12% annually, requiring higher assumed rates when planning for child education or medical corpuses.",
  },
  {
    question: "How does an inflation calculator help in retirement planning?",
    answer:
      "It projects your current monthly household expenses (e.g. ₹50,000/month today) to their actual inflated cost when you retire in 15 or 25 years (e.g. ₹2,15,000/month).",
  },
  {
    question: "What is the Rule of 70 in inflation?",
    answer:
      "Dividing 70 by the annual inflation rate gives the approximate number of years it will take for prices to double and purchasing power to halve (e.g. 70 / 6% inflation ≈ 11.6 years).",
  },
];

export default function InflationLayout({
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
        name: "Inflation Calculator",
        item: "https://volumecall.in/calculators/inflation-calculator",
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
