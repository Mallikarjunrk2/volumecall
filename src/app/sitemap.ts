import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://volumecall.in";
  const currentDate = new Date();

  const routes = [
    "",
    "/stocks",
    "/compare",
    "/ipo",
    "/markets",
    "/calculators",
    // 27 Financial Calculators
    "/calculators/sip-calculator",
    "/calculators/goal-sip-calculator",
    "/calculators/step-up-sip-calculator",
    "/calculators/swp-calculator",
    "/calculators/stp-calculator",
    "/calculators/fd-calculator",
    "/calculators/rd-calculator",
    "/calculators/bond-calculator",
    "/calculators/emi-calculator",
    "/calculators/loan-amortization-calculator",
    "/calculators/loan-prepayment-calculator",
    "/calculators/cagr-calculator",
    "/calculators/absolute-return-calculator",
    "/calculators/irr-calculator",
    "/calculators/xirr-calculator",
    "/calculators/time-weighted-return-calculator",
    "/calculators/inflation-calculator",
    "/calculators/retirement-calculator",
    "/calculators/emergency-fund-calculator",
    "/calculators/compound-interest-calculator",
    "/calculators/future-value-calculator",
    "/calculators/present-value-calculator",
    "/calculators/dcf-calculator",
    "/calculators/reverse-dcf-calculator",
    "/calculators/pe-valuation-calculator",
    "/calculators/ev-ebitda-calculator",
    "/calculators/ddm-calculator",
    // Info / Legal
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" || route.startsWith("/markets") ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/calculators") ? 0.8 : 0.6,
  }));
}
