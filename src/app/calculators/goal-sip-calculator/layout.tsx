import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goal SIP Calculator – Calculate SIP Required for Your Financial Goal | VolumeCall",
  description:
    "Use our Goal SIP Calculator to estimate how much you may need to invest monthly, quarterly or yearly to reach a target amount based on your investment period and assumed return.",
  alternates: {
    canonical: "https://volumecall.in/calculators/goal-sip-calculator",
  },
  openGraph: {
    title: "Goal SIP Calculator – Calculate SIP Required for Your Financial Goal | VolumeCall",
    description:
      "Use our Goal SIP Calculator to estimate how much you may need to invest monthly, quarterly or yearly to reach a target amount based on your investment period and assumed return.",
    url: "https://volumecall.in/calculators/goal-sip-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Goal SIP Calculator – Calculate SIP Required for Your Financial Goal | VolumeCall",
    description:
      "Use our Goal SIP Calculator to estimate how much you may need to invest monthly, quarterly or yearly to reach a target amount based on your investment period and assumed return.",
  },
};

const layoutFaqItems = [
  {
    question: "What is a Goal SIP Calculator?",
    answer:
      "A Goal SIP Calculator is a reverse financial calculator that estimates the regular monthly, quarterly, or yearly investment amount required to reach a specific target goal corpus (such as ₹1 Crore or ₹5 Crore) over your chosen investment period.",
  },
  {
    question: "How does a Goal SIP Calculator work?",
    answer:
      "A Goal SIP Calculator works in reverse compared to a standard SIP calculator. You enter your desired target amount, investment duration, assumed return rate, and investment frequency. The calculator then computes the required periodic contribution needed to accumulate that goal.",
  },
  {
    question: "How much SIP do I need to reach ₹1 crore?",
    answer:
      "The monthly SIP required to reach ₹1 Crore depends on your investment period and expected return. At an assumed 12% annual return, you need approximately ₹43,000/month for 10 years, ₹15,000/month for 15 years, or ₹6,500/month for 20 years.",
  },
  {
    question: "How much SIP do I need to reach ₹5 crore?",
    answer:
      "To reach a target goal of ₹5 Crore at an assumed 12% annual return, you need approximately ₹2,15,000/month for 10 years, ₹75,000/month for 15 years, or ₹32,000/month for 20 years.",
  },
  {
    question: "Does a higher expected return reduce the required SIP?",
    answer:
      "Yes, assuming a higher return rate reduces the calculated monthly SIP required because compound growth generates a larger portion of your target goal. However, higher expected returns generally involve higher market risk.",
  },
  {
    question: "Can I calculate quarterly or yearly investments?",
    answer:
      "Yes, our Goal SIP Calculator supports Monthly, Quarterly, and Yearly investment frequencies, using exact periodic compound interest rates from our financial engine.",
  },
  {
    question: "Are the returns shown by the calculator guaranteed?",
    answer:
      "No, all return rates used in the calculator are illustrative assumptions. Mutual fund and equity market returns fluctuate over time and are not guaranteed.",
  },
  {
    question: "Can I change my goal amount later?",
    answer:
      "Yes, financial goals can be adjusted at any time. You can recalculate your required SIP as your income, savings capacity, or financial targets change.",
  },
  {
    question: "Why does the required SIP change when I change the investment period?",
    answer:
      "Extending your investment duration gives compound interest more time to work, significantly reducing the monthly investment needed to hit the same financial goal.",
  },
  {
    question: "Is a Goal SIP Calculator suitable for mutual fund investments?",
    answer:
      "Yes, the Goal SIP Calculator is ideally suited for planning systematic investments in equity, hybrid, or debt mutual funds.",
  },
];

export default function GoalSipCalculatorLayout({
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
        name: "Goal SIP Calculator",
        item: "https://volumecall.in/calculators/goal-sip-calculator",
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
