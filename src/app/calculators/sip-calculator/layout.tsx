import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIP Calculator – Calculate SIP Returns Online | VolumeCall",
  description:
    "Use our free SIP Calculator to estimate SIP returns, total investment and potential maturity value. Calculate monthly SIP growth using an effective annual return methodology.",
  alternates: {
    canonical: "https://volumecall.in/calculators/sip-calculator",
  },
  openGraph: {
    title: "SIP Calculator – Calculate SIP Returns Online | VolumeCall",
    description:
      "Use our free SIP Calculator to estimate SIP returns, total investment and potential maturity value. Calculate monthly SIP growth using an effective annual return methodology.",
    url: "https://volumecall.in/calculators/sip-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "SIP Calculator – Calculate SIP Returns Online | VolumeCall",
    description:
      "Use our free SIP Calculator to estimate SIP returns, total investment and potential maturity value. Calculate monthly SIP growth using an effective annual return methodology.",
  },
};

const faqItems = [
  {
    question: "What is a SIP calculator?",
    answer:
      "A SIP calculator is a financial planning tool that estimates the future value of regular monthly investments in mutual funds or other investment schemes. By entering your monthly SIP amount, expected annual return, and investment duration, the calculator projects your total investment, estimated returns, and total maturity value.",
  },
  {
    question: "How does a SIP calculator calculate returns?",
    answer:
      "A SIP calculator uses the future value of annuity formula to compound each monthly installment over its investment period. It converts the expected annual return into a monthly periodic rate and applies compounding to each monthly deposit across the selected investment tenure.",
  },
  {
    question: "How is the monthly return calculated from the annual return?",
    answer:
      "This calculator converts the expected annual return rate into a monthly periodic rate using the Effective Annual Rate (EAR) formula: Monthly Rate = (1 + Annual Return)^(1/12) - 1. For example, a 12% annual return converts to an effective monthly rate of approximately 0.9489% (or ~0.95% per month).",
  },
  {
    question: "Why shouldn't I simply divide the annual return by 12?",
    answer:
      "Simply dividing an annual return by 12 (e.g. 12% ÷ 12 = 1% per month) assumes nominal rate division. However, compounding 1% every month actually results in an effective annual rate of 12.68%, which is higher than 12%. Converting the annual return to its exact monthly equivalent rate ensures that compounding 12 times yields precisely the expected annual return.",
  },
  {
    question: "What return rate should I enter in a SIP calculator?",
    answer:
      "The return rate you enter should reflect your expected long-term annual return from the mutual fund category you plan to invest in. Historically, Indian equity mutual funds (like Nifty 50 index funds or diversified equity funds) have delivered long-term returns in the range of 10% to 15% per annum, while debt funds typically deliver 6% to 8%. Past performance is not a guarantee of future returns.",
  },
  {
    question: "Are SIP calculator results guaranteed?",
    answer:
      "No, SIP calculator results are illustrative estimates based on a constant assumed rate of return. Mutual fund investments are subject to market risks, and actual market returns fluctuate daily. Realized returns may be higher or lower than calculated estimates.",
  },
  {
    question: "How much should I invest in a SIP every month?",
    answer:
      "The ideal monthly SIP amount depends on your personal financial goals, monthly income, essential expenses, emergency savings, and risk tolerance. A common guideline is to invest 15% to 30% of your net monthly income toward long-term financial goals.",
  },
  {
    question: "How long should I invest through SIP?",
    answer:
      "SIPs work best over longer horizons (such as 5 to 20+ years) because compounding accelerates significantly in later years. Longer investment tenures also help smooth out short-term equity market volatility through rupee-cost averaging.",
  },
  {
    question: "What is the difference between total invested amount and estimated returns?",
    answer:
      "Total invested amount is the cumulative total of money you deposit out of pocket over the investment period (Monthly SIP × 12 months × Duration). Estimated returns represent the additional wealth generated through compound interest on your deposits. Total maturity value is the sum of total invested and estimated returns.",
  },
  {
    question: "Can I use a SIP calculator for mutual funds?",
    answer:
      "Yes, the SIP calculator is primarily designed for mutual fund SIP investments in equity, hybrid, or debt funds. It can also be used to estimate growth for any recurring monthly investment scheme with compound returns.",
  },
  {
    question: "Can SIP calculators predict actual mutual fund returns?",
    answer:
      "No, SIP calculators cannot predict exact market returns. They model expected growth assuming a uniform annual rate of return. Real mutual fund returns vary month to month depending on market conditions, economic factors, and fund management.",
  },
  {
    question: "Does a higher SIP amount always mean higher returns?",
    answer:
      "Investing a higher monthly SIP amount increases your total invested capital and overall maturity value proportionally. However, the return percentage (rate of return) depends on market performance, not the size of your investment.",
  },
  {
    question: "Does increasing the SIP investment period increase the maturity value?",
    answer:
      "Yes, increasing the investment duration dramatically increases the final maturity value due to the exponential nature of compound interest. Extending your SIP by even a few years can double your overall estimated returns.",
  },
  {
    question: "What is the difference between SIP and lump sum investment?",
    answer:
      "In a SIP (Systematic Investment Plan), you invest a fixed amount regularly every month, benefiting from rupee-cost averaging and disciplined savings. In a lump sum investment, you deposit the entire capital at once on day one. SIP reduces the risk of bad market timing compared to a single lump sum deposit.",
  },
  {
    question: "Are taxes and mutual fund expenses included in SIP calculator results?",
    answer:
      "No, standard SIP calculator results do not subtract capital gains taxes (like LTCG or STCG tax in India), mutual fund expense ratios, or exit loads. The calculated total value represents gross estimated maturity before taxes and fees.",
  },
  {
    question: "How much SIP do I need to reach ₹1 crore?",
    answer:
      "The monthly SIP required to reach ₹1 Crore depends on your investment horizon and expected annual return. At an assumed 12% annual return, you need approximately ₹43,000/month for 10 years, ₹15,000/month for 15 years, or ₹6,500/month for 20 years to accumulate ₹1 Crore.",
  },
  {
    question: "How much should I invest to reach ₹5 crore?",
    answer:
      "To accumulate a target corpus of ₹5 Crore at an assumed 12% annual return, you need approximately ₹2,15,000/month for 10 years, ₹75,000/month for 15 years, or ₹32,000/month for 20 years.",
  },
  {
    question: "How is the required SIP calculated for a financial goal?",
    answer:
      "A goal planner calculates the required periodic payment by solving the future value of annuity formula in reverse: P = Goal Corpus / [ ((1 + r)^n - 1) / r ], where r is the monthly periodic return rate and n is total investment periods.",
  },
  {
    question: "Can I calculate the SIP required for a specific target amount?",
    answer:
      "Yes, our Goal Planner section allows you to enter any target goal corpus (such as ₹50 Lakhs, ₹1 Crore, or ₹5 Crores) and choose your timeline to immediately calculate the required investment.",
  },
  {
    question: "Does a higher expected return reduce the required SIP?",
    answer:
      "Yes, a higher expected annual return rate means compound interest generates a larger portion of your target corpus, thereby reducing the required monthly out-of-pocket investment.",
  },
  {
    question: "Can I calculate quarterly or yearly investments for a goal?",
    answer:
      "Yes, our Goal Planner supports Monthly, Quarterly, and Yearly investment frequencies. It calculates the exact required payment for each frequency using periodic compounding rates.",
  },
  {
    question: "Are the return assumptions guaranteed?",
    answer:
      "No, return assumptions used in goal planning calculations are illustrative scenarios. Mutual fund investments are market-linked, and actual realized returns will vary based on market conditions.",
  },
];

export default function SipCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
        name: "SIP Calculator",
        item: "https://volumecall.in/calculators/sip-calculator",
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
