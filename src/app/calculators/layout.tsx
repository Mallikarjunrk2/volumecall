import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Calculators – 27 Free Investment, Loan & Valuation Calculators | VolumeCall",
  description:
    "Explore VolumeCall's comprehensive suite of 27 free financial calculators for SIP, Goal Planning, EMI, Fixed Deposits, CAGR, XIRR, Retirement, DCF, and Stock Valuation.",
  alternates: {
    canonical: "https://volumecall.in/calculators",
  },
  openGraph: {
    title: "Financial Calculators – 27 Free Investment, Loan & Valuation Calculators | VolumeCall",
    description:
      "Explore VolumeCall's comprehensive suite of 27 free financial calculators for SIP, Goal Planning, EMI, Fixed Deposits, CAGR, XIRR, Retirement, DCF, and Stock Valuation.",
    url: "https://volumecall.in/calculators",
    type: "website",
    siteName: "VolumeCall",
  },
  twitter: {
    card: "summary",
    title: "Financial Calculators – 27 Free Investment, Loan & Valuation Calculators | VolumeCall",
    description:
      "Explore VolumeCall's comprehensive suite of 27 free financial calculators for SIP, Goal Planning, EMI, Fixed Deposits, CAGR, XIRR, Retirement, DCF, and Stock Valuation.",
  },
};

export default function CalculatorsHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
