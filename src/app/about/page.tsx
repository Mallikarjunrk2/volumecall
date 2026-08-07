import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "About Us | VolumeCall",
  description: "Learn more about VolumeCall, an Indian stock research and screening platform.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-3">
          About VolumeCall
        </h1>
        <div className="text-sm text-slate-700 dark:text-slate-350 space-y-4 leading-relaxed">
          <p>
            Welcome to <span className="font-semibold text-teal-700 dark:text-teal-400">VolumeCall</span>, a modern stock research and screening platform built specifically for the Indian stock market (NSE).
          </p>
          <p>
            Our core mission is to provide clean, information-first, and highly-performant research utilities for individual investors, analysts, and traders. VolumeCall is built without clutter: no distracting banners, no flashing ads, and no promotional hype. We focus strictly on the financial numbers and technical indicators that matter.
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
            Technical Architecture
          </h2>
          <p>
            VolumeCall is engineered using Next.js (App Router) and TypeScript. We normalize raw market payloads securely on our server layer, protecting tokens and integrating with official Upstox APIs. Charting is powered by Lightweight Charts, a high-performance open-source canvas utility, ensuring smooth interaction across mobile and desktop interfaces.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
