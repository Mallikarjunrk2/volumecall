import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retirement Calculator – Calculate Retirement Corpus & Monthly SIP in India | VolumeCall",
  description:
    "Free Retirement Calculator to calculate total retirement corpus required, future inflated living expenses, and monthly SIP investment needed for a financially secure retirement in India.",
  alternates: {
    canonical: "https://volumecall.in/calculators/retirement-calculator",
  },
  openGraph: {
    title: "Retirement Calculator – Calculate Retirement Corpus & Monthly SIP in India | VolumeCall",
    description:
      "Free Retirement Calculator to calculate total retirement corpus required, future inflated living expenses, and monthly SIP investment needed for a financially secure retirement in India.",
    url: "https://volumecall.in/calculators/retirement-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Retirement Calculator – Calculate Retirement Corpus & Monthly SIP in India | VolumeCall",
    description:
      "Free Retirement Calculator to calculate total retirement corpus required, future inflated living expenses, and monthly SIP investment needed for a financially secure retirement in India.",
  },
};

const layoutFaqItems = [
  {
    question: "How much retirement corpus do I need in India?",
    answer:
      "Your required retirement corpus depends on your current monthly living expenses, years until retirement, expected life expectancy, and inflation. For an urban household spending ₹50,000/month today, retiring in 25 years requires an estimated corpus of ₹3.5 to ₹5.0 Crore.",
  },
  {
    question: "How does inflation impact retirement planning?",
    answer:
      "Inflation increases your future cost of living. At 6% inflation, a monthly expense of ₹50,000 today will expand to ~₹2,15,000 per month in 25 years just to maintain the same standard of living.",
  },
  {
    question: "How is the required monthly SIP for retirement calculated?",
    answer:
      "The calculator computes your required retirement corpus and solves the reverse annuity formula: SIP = Required Corpus / [ ((1 + r)^n - 1) / r ], where r is the monthly pre-retirement return rate.",
  },
  {
    question: "What is the 4% rule in retirement planning?",
    answer:
      "The 4% rule suggests that withdrawing 4% of your total retirement nest egg in the first year (and adjusting for inflation thereafter) gives a high probability that your savings will last at least 30 years.",
  },
  {
    question: "What returns should I assume before and after retirement?",
    answer:
      "Pre-retirement (accumulation phase): 12%–14% p.a. using diversified equity mutual funds. Post-retirement (distribution phase): 7%–9% p.a. using conservative hybrid, debt funds, and senior citizen savings schemes.",
  },
  {
    question: "What is the National Pension System (NPS) and how does it fit in?",
    answer:
      "NPS is a government-regulated retirement savings vehicle offering tax deductions up to ₹2 Lakh under Section 80CCD, with mandatory 40% annuity purchase at retirement.",
  },
  {
    question: "How do medical and healthcare expenses affect retirement?",
    answer:
      "Healthcare inflation in India runs at 10%–14% p.a. Experts recommend purchasing a comprehensive super top-up health insurance policy (₹50L to ₹1Cr coverage) separate from your living expense corpus.",
  },
  {
    question: "What happens if I delay starting my retirement SIP by 5 years?",
    answer:
      "Delaying your retirement SIP by just 5 years can nearly double the monthly savings required to hit the same retirement corpus due to lost compound growth.",
  },
  {
    question: "Can I use an SWP (Systematic Withdrawal Plan) in retirement?",
    answer:
      "Yes. An SWP from mutual funds is the most tax-efficient method to generate monthly pension payouts while letting the remaining corpus continue growing.",
  },
  {
    question: "What life expectancy should I plan for in India?",
    answer:
      "With modern medical advancements, financial planners recommend planning for a life expectancy of at least 85 to 90 years to prevent outliving your retirement savings.",
  },
];

export default function RetirementLayout({
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
        name: "Retirement Calculator",
        item: "https://volumecall.in/calculators/retirement-calculator",
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
