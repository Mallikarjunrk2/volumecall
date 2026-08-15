import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bond Calculator – Bond Price & YTM Calculator | VolumeCall",
  description:
    "Calculate bond market prices, Yield to Maturity (YTM), and coupon cash flows for Indian government securities (G-Secs) and corporate bonds.",
  alternates: {
    canonical: "https://volumecall.in/calculators/bond-calculator",
  },
  openGraph: {
    title: "Bond Calculator – Bond Price & YTM Calculator | VolumeCall",
    description:
      "Calculate bond market prices, Yield to Maturity (YTM), and coupon cash flows for Indian government securities (G-Secs) and corporate bonds.",
    url: "https://volumecall.in/calculators/bond-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Bond Calculator – Bond Price & YTM Calculator | VolumeCall",
    description:
      "Calculate bond market prices, Yield to Maturity (YTM), and coupon cash flows for Indian government securities (G-Secs) and corporate bonds.",
  },
};

const layoutFaqItems = [
  {
    question: "What is Yield to Maturity (YTM) on a bond?",
    answer:
      "Yield to Maturity (YTM) is the total annualized rate of return anticipated on a bond if it is held until maturity, accounting for all periodic coupon payments and the difference between current purchase price and face value.",
  },
  {
    question: "How is bond price related to bond yield?",
    answer:
      "Bond prices and yields have an inverse relationship. When market yields rise, existing bond prices fall. When market yields fall, existing bond prices rise.",
  },
  {
    question: "What is the difference between Coupon Rate and Current Yield?",
    answer:
      "The Coupon Rate is the fixed annual interest paid on the face value. Current Yield is the annual coupon payment divided by the bond's current market price.",
  },
  {
    question: "What does it mean if a bond trades at a Premium or Discount?",
    answer:
      "A bond trades at a Premium when its market price is above face value (YTM < Coupon Rate). It trades at a Discount when its market price is below face value (YTM > Coupon Rate).",
  },
  {
    question: "What is an Indian Government Security (G-Sec)?",
    answer:
      "G-Secs are sovereign debt instruments issued by the Reserve Bank of India on behalf of the Central Government with virtually zero credit default risk.",
  },
  {
    question: "How often are bond coupons paid in India?",
    answer:
      "Most Indian corporate bonds and government securities pay coupon interest semi-annually (twice a year) or annually.",
  },
  {
    question: "How are bond returns taxed in India?",
    answer:
      "Coupon interest is taxed at your income tax slab rate. Capital gains on listed bonds held over 12 months are taxed as long-term capital gains at 12.5% without indexation.",
  },
  {
    question: "What is credit risk in corporate bonds?",
    answer:
      "Credit risk is the probability that the bond issuer may default on coupon payments or principal repayment at maturity. Credit rating agencies (CRISIL, ICRA, CARE) assign ratings like AAA, AA, BBB to indicate safety.",
  },
  {
    question: "Can I sell a bond before its maturity date?",
    answer:
      "Yes. Listed bonds can be traded in the secondary market on NSE/BSE or specialized online bond platforms at prevailing market prices.",
  },
  {
    question: "What is modified duration in bond investing?",
    answer:
      "Modified duration measures a bond's price sensitivity to changes in interest rates. A duration of 5 means the bond price will change approximately 5% for every 1% change in yield.",
  },
];

export default function BondLayout({
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
        name: "Bond Calculator",
        item: "https://volumecall.in/calculators/bond-calculator",
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
