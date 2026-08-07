import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Financial Disclaimer | VolumeCall",
  description: "Read the VolumeCall financial disclaimer and investment disclosure statement.",
};

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-3">
          Disclaimer
        </h1>
        <div className="text-sm text-slate-700 dark:text-slate-350 space-y-4 leading-relaxed">
          <p>
            <span className="font-semibold text-slate-900 dark:text-slate-100">No Investment Advice:</span>{" "}
            All content on VolumeCall (volumecall.in) is for informational and educational purposes only. Nothing on this website constitutes professional financial, investment, tax, or legal advice. No content on the site is a recommendation or solicitation to buy, sell, or hold any security, derivative, or financial instrument.
          </p>
          <p>
            <span className="font-semibold text-slate-900 dark:text-slate-100">No Advisory Status:</span>{" "}
            VolumeCall is not a registered investment advisor under SEBI (Securities and Exchange Board of India) regulations. We do not provide investment advisory services or stock recommendations.
          </p>
          <p>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Risk Warning:</span>{" "}
            Equity trading and investments are subject to high market risk. Past performance is not indicative of future results. Capital leverage can lead to significant losses. You should conduct independent research and verify any metrics before making investment choices.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
