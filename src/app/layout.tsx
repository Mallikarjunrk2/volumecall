import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://volumecall.in"),
  title: {
    default: "VolumeCall | Indian Stock Research & Analysis Platform",
    template: "%s | VolumeCall",
  },
  description:
    "Research NSE & BSE stocks with live prices, balance sheet, cash flow, quarterly results, peer comparison, DCF valuation, and key ratios. Track Nifty 50, Sensex & Bank Nifty. No ads, no tips, just data for Indian equity investors.",
  applicationName: "VolumeCall",
  authors: [{ name: "VolumeCall", url: "https://volumecall.in" }],
  publisher: "VolumeCall",
  creator: "VolumeCall",
  keywords: [
    "NSE stock analysis",
    "BSE stock research",
    "Indian stock market",
    "Indian stock market screener",
    "Screener for Indian stock market",
    "stock valuation India",
    "stock fundamentals India",
    "balance sheet analysis India",
    "cash flow statement India",
    "quarterly results NSE",
    "peer comparison stocks",
    "DCF valuation calculator",
    "reverse DCF calculator",
    "stock ratios India",
    "Nifty 50 tracker",
    "Sensex tracker",
    "Bank Nifty",
    "IPO analysis India",
    "financial calculators India",
    "SIP calculator India",
  ],
  icons: {
    icon: [
      { url: "/icon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  verification: {
    google: "google2489c3421a4201c6",
  },
  openGraph: {
    title: "VolumeCall | Indian Stock Research & Analysis",
    description:
      "Live prices, balance sheet, cash flow, quarterly results, peer comparison, DCF valuation & ratios for NSE/BSE stocks — no ads, no noise.",
    url: "https://volumecall.in",
    siteName: "VolumeCall",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://volumecall.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "VolumeCall - Indian Stock Research & Analysis Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VolumeCall | Indian Stock Research & Analysis",
    description:
      "Live prices, balance sheet, cash flow, quarterly results, peer comparison, and DCF valuation for NSE/BSE stocks.",
    images: ["https://volumecall.in/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Organization & WebSite JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "VolumeCall",
                url: "https://volumecall.in",
                logo: "https://volumecall.in/icon-512.png",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "VolumeCall",
                url: "https://volumecall.in",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://volumecall.in/stocks?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        {/* Google Analytics Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6VMRS25DY2"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6VMRS25DY2');
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


