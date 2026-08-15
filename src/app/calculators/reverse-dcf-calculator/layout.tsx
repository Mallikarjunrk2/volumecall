import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reverse DCF Calculator – Implied Stock Growth Rate | VolumeCall",
  description:
    "Calculate the implied Free Cash Flow (FCF) growth rate priced into a stock's current market price using our Reverse DCF valuation model.",
  alternates: {
    canonical: "https://volumecall.in/calculators/reverse-dcf-calculator",
  },
  openGraph: {
    title: "Reverse DCF Calculator – Implied Stock Growth Rate | VolumeCall",
    description:
      "Calculate the implied Free Cash Flow (FCF) growth rate priced into a stock's current market price using our Reverse DCF valuation model.",
    url: "https://volumecall.in/calculators/reverse-dcf-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Reverse DCF Calculator – Implied Stock Growth Rate | VolumeCall",
    description:
      "Calculate the implied Free Cash Flow (FCF) growth rate priced into a stock's current market price using our Reverse DCF valuation model.",
  },
};

const layoutFaqItems = [
  {
    question: "What is a Reverse DCF (Discounted Cash Flow)?",
    answer:
      "A Reverse DCF is a valuation technique pioneered by legendary investor Michael Mauboussin. Instead of forecasting future cash flows to calculate fair value, it starts with the current stock price and solves for the market's implied future growth rate.",
  },
  {
    question: "Why is Reverse DCF often superior to traditional DCF?",
    answer:
      "Traditional DCF requires predicting the exact future (which is impossible). Reverse DCF turns the question on its head: 'What growth is the market already expecting from this company, and is that expectation realistic?'",
  },
  {
    question: "How does the Reverse DCF solver work?",
    answer:
      "The solver uses numerical root-finding algorithms (Secant and Bisection) to find the exact annual FCF growth rate `g` that equates the DCF equity value to the company's current market cap.",
  },
  {
    question: "What does it mean if the implied growth rate is very high (e.g. 35% p.a.)?",
    answer:
      "A very high implied growth rate indicates that the stock is priced for perfection. If the company fails to grow FCF at 35% annually, its stock price will likely suffer a sharp valuation multiple de-rating.",
  },
  {
    question: "What does a negative or low implied growth rate mean?",
    answer:
      "A low or negative implied growth rate suggests extreme market pessimism. If the company achieves even modest 8%–10% growth, the stock has significant potential for upside re-rating.",
  },
  {
    question: "How should Base FCF (t=0) be selected?",
    answer:
      "Use trailing 12-month (TTM) Free Cash Flow, or a 3-year normalized average FCF if the company recently had temporary working capital spikes or unusual one-off capital expenditures.",
  },
  {
    question: "What role does WACC play in Reverse DCF?",
    answer:
      "WACC represents the required rate of return. A higher assumed WACC will require higher implied cash flow growth to justify the current market valuation.",
  },
  {
    question: "How does Terminal Growth Rate (g) affect the implied forecast growth?",
    answer:
      "A lower terminal growth assumption forces the 5-year explicit forecast period to deliver a higher implied growth rate to reach the current market price.",
  },
  {
    question: "How do value investors use Reverse DCF?",
    answer:
      "Value investors (like Warren Buffett and Charlie Munger) use Reverse DCF to avoid overpaying for growth stocks by checking whether market expectations are modest or egregiously exaggerated.",
  },
  {
    question: "Can Reverse DCF be applied to Indian mid-cap and small-cap stocks?",
    answer:
      "Yes. It is particularly effective for evaluating high-PE Indian growth stocks (e.g. consumer tech, chemical, EMS) to see if their 50x–80x P/E multiples are mathematically justifiable.",
  },
];

export default function ReverseDcfLayout({
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
        name: "Reverse DCF Calculator",
        item: "https://volumecall.in/calculators/reverse-dcf-calculator",
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
