import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VolumeCall | Indian Stock Research & Analysis",
    short_name: "VolumeCall",
    description:
      "Research NSE & BSE stocks with live prices, balance sheet, cash flow, quarterly results, peer comparison, DCF valuation, and key ratios. No ads, no tips, just data.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#0D9488",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/volumecall-v-black.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
