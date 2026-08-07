import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy | VolumeCall",
  description: "Read our Privacy Policy to understand how we protect and manage user data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-3">
          Privacy Policy
        </h1>
        <div className="text-sm text-slate-700 dark:text-slate-350 space-y-4 leading-relaxed">
          <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: August 3, 2026</p>
          <p>
            At VolumeCall, we respect your privacy. This Privacy Policy details how we collect, process, and protect information when you use our website, volumecall.in.
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">1. Data Collection</h2>
          <p>
            For Phase 1, VolumeCall does not require registration or authentication. We do not store personal details. Standard server access logs and telemetry may be recorded to prevent abuse, enforce security, and optimize performance.
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">2. Cookies</h2>
          <p>
            We use local storage only to persist configuration preferences (such as light/dark mode selection). No tracking cookies or advertising pixels are used in Phase 1.
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">3. Third-Party Integrations</h2>
          <p>
            Financial data is fetched dynamically from Upstox. All requests are securely proxied through our servers, meaning your device never interacts with Upstox directly.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
