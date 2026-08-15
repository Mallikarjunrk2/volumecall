import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XIRR Calculator – Calculate Mutual Fund XIRR | VolumeCall",
  description:
    "Calculate Extended Internal Rate of Return (XIRR) for SIP investments, mutual fund transactions, and irregular cash flow portfolios in India.",
  alternates: {
    canonical: "https://volumecall.in/calculators/xirr-calculator",
  },
  openGraph: {
    title: "XIRR Calculator – Calculate Mutual Fund XIRR | VolumeCall",
    description:
      "Calculate Extended Internal Rate of Return (XIRR) for SIP investments, mutual fund transactions, and irregular cash flow portfolios in India.",
    url: "https://volumecall.in/calculators/xirr-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "XIRR Calculator – Calculate Mutual Fund XIRR | VolumeCall",
    description:
      "Calculate Extended Internal Rate of Return (XIRR) for SIP investments, mutual fund transactions, and irregular cash flow portfolios in India.",
  },
};

const layoutFaqItems = [
  {
    question: "What is XIRR (Extended Internal Rate of Return)?",
    answer:
      "XIRR (Extended Internal Rate of Return) is an annualized return metric that calculates the exact internal rate of return for a series of cash flows occurring at irregular calendar dates.",
  },
  {
    question: "Why is XIRR used for mutual fund SIP returns instead of CAGR?",
    answer:
      "CAGR can only measure return on a single lump sum. Because an SIP involves multiple purchases on different calendar dates over months or years, XIRR is required to account for the unique holding period of each installment.",
  },
  {
    question: "How is XIRR calculated?",
    answer:
      "XIRR is solved numerically using Brent's algorithm from the equation: ∑ [ CF_i / (1 + XIRR)^((date_i - date_0) / 365) ] = 0, where CF_i are cash inflows and outflows.",
  },
  {
    question: "What is the difference between IRR and XIRR?",
    answer:
      "IRR assumes all cash flows happen at fixed, equal intervals (e.g. exactly every 365 days). XIRR uses exact calendar dates, making it accurate for real-world investments with weekends, holidays, and irregular deposits.",
  },
  {
    question: "Can XIRR be calculated for stock trading portfolios?",
    answer:
      "Yes. Whenever you buy stocks on different dates and redeem partial or total holdings later, XIRR gives the true annualized performance of your invested capital.",
  },
  {
    question: "What does a negative XIRR mean?",
    answer:
      "A negative XIRR indicates that your current portfolio valuation is lower than the net capital invested, representing an annualized loss across your cash flow history.",
  },
  {
    question: "How should current portfolio value be entered in an XIRR calculation?",
    answer:
      "The current market value of your portfolio should be entered as a positive (+) cash flow on today's date, representing the hypothetical redemption value.",
  },
  {
    question: "Why does XIRR look unusually high for investments held under 1 year?",
    answer:
      "XIRR annualizes all returns to a 365-day basis. If an investment gains 10% in 15 days, annualizing that short burst produces an artificially extreme XIRR. For holding periods under 1 year, absolute return is more meaningful.",
  },
  {
    question: "Does XIRR account for mutual fund dividends or STCG/LTCG taxes?",
    answer:
      "XIRR calculates returns based on the actual cash flows entered. If you receive dividends, include them as positive cash inflows on their payout dates. Taxes are not deducted unless net post-tax cash flows are entered.",
  },
  {
    question: "Is XIRR the standard performance metric shown by Indian mutual fund apps?",
    answer:
      "Yes. Major Indian mutual fund platforms, registrar portals (CAMS, KFintech), and fund houses universally display XIRR as the official annualized return on SIP portfolios.",
  },
];

export default function XirrLayout({
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
        name: "XIRR Calculator",
        item: "https://volumecall.in/calculators/xirr-calculator",
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
