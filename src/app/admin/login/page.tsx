"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/admin" });
    } catch (err) {
      console.error("Google sign in failed:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-8 space-y-6 shadow-sm">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2">
            <span className="h-5 w-5 rounded-xs bg-[#0D9488] dark:bg-[#2DD4BF] flex items-center justify-center shrink-0">
              <span className="h-2 w-2 bg-white dark:bg-black rounded-xs" />
            </span>
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] uppercase">
              VolumeCall
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Admin CMS Authentication
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Restricted access portal for authorized research administrators.
          </p>
        </div>

        {/* Error Alert */}
        {error === "unauthorized" && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-md flex items-start space-x-3 text-red-600 dark:text-red-400 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unauthorized Account</p>
              <p className="mt-0.5 text-red-600/80 dark:text-red-400/80">
                Your Google account is not on the administrator allowlist. Please sign in with an approved administrator email.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 bg-white dark:bg-[#141414] hover:bg-neutral-50 dark:hover:bg-[#1f1f1f] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-md font-medium text-sm transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {/* Google Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? "Authenticating..." : "Sign in with Google"}</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-[var(--border-subtle)] text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <span>Return to VolumeCall Public Terminal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-base)]" />}>
      <LoginContent />
    </Suspense>
  );
}
