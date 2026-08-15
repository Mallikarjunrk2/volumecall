import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time-Weighted Return (TWR) Calculator | VolumeCall",
  description:
    "Measure investment portfolio performance independently of external cash flow timing across multiple sub-periods using our free TWR calculator.",
  alternates: {
    canonical: "https://volumecall.in/calculators/time-weighted-return-calculator",
  },
  openGraph: {
    title: "Time-Weighted Return (TWR) Calculator | VolumeCall",
    description:
      "Measure investment portfolio performance independently of external cash flow timing across multiple sub-periods using our free TWR calculator.",
    url: "https://volumecall.in/calculators/time-weighted-return-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Time-Weighted Return (TWR) Calculator | VolumeCall",
    description:
      "Measure investment portfolio performance independently of external cash flow timing across multiple sub-periods using our free TWR calculator.",
  },
};

const layoutFaqItems = [
  {
    question: "What is Time-Weighted Return (TWR)?",
    answer:
      "Time-Weighted Return (TWR) is a measure of the compound rate of growth in a portfolio that eliminates the distorting effects on growth rates created by external cash inflows and outflows (deposits and withdrawals).",
  },
  {
    question: "Why do fund managers prefer TWR over Money-Weighted Return (MWR / IRR)?",
    answer:
      "Fund managers have no control over when clients deposit or withdraw money. TWR isolates the pure investment performance of the manager's asset allocation and stock selection decisions.",
  },
  {
    question: "How is Time-Weighted Return calculated across sub-periods?",
    answer:
      "TWR breaks the overall period into sub-periods every time a cash flow occurs. It calculates the rate of return for each sub-period: R_i = (End Value Before Cash Flow - Start Value) / Start Value, and links them geometrically: TWR = (1 + R_1) × (1 + R_2) × ... × (1 + R_n) - 1.",
  },
  {
    question: "What is the difference between TWR and MWR (Money-Weighted Return / XIRR)?",
    answer:
      "TWR measures the manager's skill by giving equal weight to each time period. MWR/XIRR measures the investor's actual rupee return, giving greater weight to periods when more capital was invested.",
  },
  {
    question: "Is TWR required under GIPS (Global Investment Performance Standards)?",
    answer:
      "Yes. The CFA Institute's GIPS standards require investment managers to present portfolio performance using Time-Weighted Return to ensure fair, unbiased reporting.",
  },
  {
    question: "Can TWR be higher than MWR?",
    answer:
      "Yes. If an investor deposits large sums of money right before a market downturn, MWR will be significantly lower than TWR. Conversely, investing heavily right before a bull run makes MWR higher than TWR.",
  },
  {
    question: "When should an individual retail investor use TWR?",
    answer:
      "Use TWR when evaluating mutual fund performance against a benchmark index (like Nifty 50) to see if the fund manager outperformed the market.",
  },
  {
    question: "How often should sub-periods be created in TWR?",
    answer:
      "A new sub-period must be created every time an external deposit or withdrawal occurs, requiring a portfolio valuation immediately before the cash flow takes place.",
  },
  {
    question: "Can TWR be negative?",
    answer:
      "Yes. If the cumulative geometric product of sub-period returns is less than 1.0, the TWR will be negative, indicating a strategy drawdown.",
  },
  {
    question: "Does TWR account for dividends received inside the portfolio?",
    answer:
      "Yes. Internal dividends reinvested inside the fund naturally increase the ending sub-period valuation and are fully captured in the TWR calculation.",
  },
];

export default function TwrLayout({
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
        name: "Time-Weighted Return Calculator",
        item: "https://volumecall.in/calculators/time-weighted-return-calculator",
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
