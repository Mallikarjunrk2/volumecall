import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRR Calculator – Internal Rate of Return & NPV | VolumeCall",
  description:
    "Calculate the Internal Rate of Return (IRR) and Net Present Value (NPV) for capital budgeting, investment projects, and irregular cash flows.",
  alternates: {
    canonical: "https://volumecall.in/calculators/irr-calculator",
  },
  openGraph: {
    title: "IRR Calculator – Internal Rate of Return & NPV | VolumeCall",
    description:
      "Calculate the Internal Rate of Return (IRR) and Net Present Value (NPV) for capital budgeting, investment projects, and irregular cash flows.",
    url: "https://volumecall.in/calculators/irr-calculator",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "IRR Calculator – Internal Rate of Return & NPV | VolumeCall",
    description:
      "Calculate the Internal Rate of Return (IRR) and Net Present Value (NPV) for capital budgeting, investment projects, and irregular cash flows.",
  },
};

const layoutFaqItems = [
  {
    question: "What is Internal Rate of Return (IRR)?",
    answer:
      "Internal Rate of Return (IRR) is the annual discount rate at which the Net Present Value (NPV) of all future cash flows (both positive and negative) from an investment or project equals zero.",
  },
  {
    question: "How is IRR calculated?",
    answer:
      "IRR is solved numerically through iteration from the equation: NPV = ∑ [ CF_t / (1 + IRR)^t ] = 0, where CF_t is the net cash flow at period t.",
  },
  {
    question: "What is the difference between IRR and XIRR?",
    answer:
      "IRR assumes cash flows occur at equal, regular periodic intervals (e.g. exactly once a year or once a month). XIRR allows exact specific calendar dates for irregular cash flows.",
  },
  {
    question: "How is IRR used in capital budgeting and business decisions?",
    answer:
      "If a project's IRR exceeds the company's cost of capital (or hurdle rate / WACC), the project is considered economically profitable and acceptable.",
  },
  {
    question: "Can an investment have multiple IRRs?",
    answer:
      "Yes. If cash flows switch signs more than once (e.g., negative, positive, negative), the polynomial equation can produce multiple mathematical roots (multiple IRRs).",
  },
  {
    question: "What is the reinvestment rate assumption in IRR?",
    answer:
      "Standard IRR inherently assumes that all intermediate cash inflows are reinvested at the same rate as the IRR, which may be unrealistic for exceptionally high IRRs.",
  },
  {
    question: "What is the difference between IRR and ROI?",
    answer:
      "ROI (Return on Investment) only calculates total percentage gain without accounting for time or the timing of cash flows, whereas IRR discounts all cash flows over their exact time periods.",
  },
  {
    question: "Can IRR be negative?",
    answer:
      "Yes. If total cash inflows over the project life are less than the initial investment outlay, the resulting IRR will be negative.",
  },
  {
    question: "How does Net Present Value (NPV) relate to IRR?",
    answer:
      "When the discount rate equals the IRR, the project's NPV is exactly zero. When the discount rate is below IRR, NPV is positive.",
  },
  {
    question: "Which investments are best analyzed using IRR?",
    answer:
      "Private equity investments, real estate rental development, infrastructure projects, corporate capital expenditure, and regular-interval insurance endowment plans.",
  },
];

export default function IrrLayout({
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
        name: "IRR Calculator",
        item: "https://volumecall.in/calculators/irr-calculator",
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
