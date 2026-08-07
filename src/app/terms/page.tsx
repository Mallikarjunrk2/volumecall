import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Terms & Conditions | VolumeCall",
  description: "Read the Terms & Conditions governing the use of the VolumeCall stock research platform.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-3">
          Terms & Conditions
        </h1>
        <div className="text-sm text-slate-700 dark:text-slate-350 space-y-4 leading-relaxed">
          <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: August 3, 2026</p>
          <p>
            By accessing or using the VolumeCall platform (volumecall.in), you agree to comply with and be bound by these Terms & Conditions.
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">1. Use of the Site</h2>
          <p>
            VolumeCall provides tools for fundamental research, market indicators, and educational studies. You agree to use the site only for lawful, personal, and non-commercial purposes. Scraping, crawling, or hammering our backend API endpoints is strictly prohibited.
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">2. Accuracy of Financial Data</h2>
          <p>
            Market indices, ratios, profiles, and historical prices are sourced from third-party provider Upstox. While we work to ensure reliability, we cannot guarantee absolute accuracy, completeness, or timeliness of data.
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">3. Limitation of Liability</h2>
          <p>
            VolumeCall and its operators are not responsible for any financial losses or investment decisions made based on information presented on this site.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
