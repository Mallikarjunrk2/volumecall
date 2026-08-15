import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STP Calculator – Calculate Systematic Transfer Plan Returns | VolumeCall",
  description:
    "Free STP Calculator to simulate systematic transfers from debt/liquid funds to equity mutual funds. Calculate source balance, target growth, and combined portfolio value.",
  alternates: {
    canonical: "https://volumecall.in/calculators/stp-calculator",
  },
  openGraph: {
    title: "STP Calculator – Calculate Systematic Transfer Plan Returns | VolumeCall",
    description:
      "Free STP Calculator to simulate systematic transfers from debt/liquid funds to equity mutual funds. Calculate source balance, target growth, and combined portfolio value.",
    url: "https://volumecall.in/calculators/stp-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "STP Calculator – Calculate Systematic Transfer Plan Returns | VolumeCall",
    description:
      "Free STP Calculator to simulate systematic transfers from debt/liquid funds to equity mutual funds. Calculate source balance, target growth, and combined portfolio value.",
  },
};

const layoutFaqItems = [
  {
    question: "What is a Systematic Transfer Plan (STP)?",
    answer:
      "A Systematic Transfer Plan (STP) is an automated mutual fund strategy where an investor parks a lump sum in a low-risk source fund (such as a liquid or ultra-short duration debt fund) and systematically transfers a fixed amount periodically into an equity target fund.",
  },
  {
    question: "How does an STP calculator work?",
    answer:
      "An STP calculator models dual-fund accounting: it grows the remaining source fund balance at the source return rate, transfers fixed monthly tranches to the target fund, and compounds the accumulated units in the target fund at the target return rate.",
  },
  {
    question: "Why is STP better than a direct lump sum investment in equity?",
    answer:
      "Deploying a large lump sum directly into equity exposes you to the risk of investing at a market peak. An STP spaces out entry points over 12 to 36 months, providing rupee-cost averaging while earning 6%–7% p.a. on the idle cash in the liquid fund.",
  },
  {
    question: "What is the difference between STP and SIP?",
    answer:
      "In an SIP, installments are deducted from your bank savings account (which earns 2.5%–3.5% interest). In an STP, installments are transferred from a liquid/debt mutual fund (which historically yields 6%–7% p.a.), generating higher returns on the waiting capital.",
  },
  {
    question: "Can I do an STP between different mutual fund companies (AMCs)?",
    answer:
      "No. An automated STP can only be executed between schemes within the same Asset Management Company (mutual fund house), such as transferring from HDFC Liquid Fund to HDFC Top 100 Fund.",
  },
  {
    question: "What are the common types of STP?",
    answer:
      "The three common STP types are Fixed STP (transferring a fixed rupee amount), Capital Appreciation STP (transferring only the profit/gains from the source fund), and Flexi STP (variable transfers based on market valuation triggers).",
  },
  {
    question: "Are STP transfers subject to taxes in India?",
    answer:
      "Yes. Every transfer from the source fund is treated as a redemption and is subject to capital gains tax according to debt fund taxation rules applicable for that financial year.",
  },
  {
    question: "What is the ideal duration for an STP into equity funds?",
    answer:
      "Financial planners typically recommend an STP duration of 6 to 12 months for moderate lump sums, and 18 to 36 months for very large windfalls (like property sales or retirement gratuities) to smooth equity volatility.",
  },
  {
    question: "What happens when the source fund balance runs out?",
    answer:
      "Once the source fund balance reaches zero, the automated STP simply concludes. Your accumulated capital continues compounding inside the target equity fund.",
  },
  {
    question: "Are STP return estimates guaranteed?",
    answer:
      "No. Mutual fund returns are market-linked and not guaranteed. The calculator provides illustrative estimates based on user-entered annualized return assumptions.",
  },
];

export default function StpLayout({
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
        name: "STP Calculator",
        item: "https://volumecall.in/calculators/stp-calculator",
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
