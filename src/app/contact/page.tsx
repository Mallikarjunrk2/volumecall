import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Contact Us | VolumeCall",
  description: "Get in touch with the VolumeCall stock research team.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-3">
          Contact Us
        </h1>
        <div className="text-sm text-slate-700 dark:text-slate-350 space-y-4 leading-relaxed">
          <p>
            Have feedback, feature requests, or questions about the VolumeCall platform? We would love to hear from you.
          </p>
          <div className="border border-slate-200 dark:border-slate-800 rounded-sm p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Email Address</h3>
            <p className="font-mono text-sm text-teal-700 dark:text-teal-450">support@volumecall.in</p>
          </div>
          <p>
            We typically respond to inquiries within 24–48 business hours. Thank you for your support as we continue expanding VolumeCall&apos;s capabilities.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
