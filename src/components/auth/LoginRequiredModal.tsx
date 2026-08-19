"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { X, Lock, Bookmark } from "lucide-react";

export type LoginReason = "stock_limit" | "watchlist";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: LoginReason;
}

export function LoginRequiredModal({
  isOpen,
  onClose,
  reason = "stock_limit",
}: LoginRequiredModalProps) {
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    const callbackUrl = typeof window !== "undefined" ? window.location.href : "/";
    signIn("google", { callbackUrl });
  };

  const isStockLimit = reason === "stock_limit";

  const title = isStockLimit ? "Keep exploring stocks for Free" : "Save this stock";
  const description = isStockLimit
    ? "You've explored 3 stocks as a guest. to get unlimited access sign with Google"
    : "Sign in with Google to save stocks to your VolumeCall watchlist and access them from any device.";
  const supportingText = isStockLimit
    ? "Free account · No payment required · Unlimited stock research"
    : "Free account · No payment required";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click area */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg shadow-2xl p-6 sm:p-8 space-y-6 z-10 text-[var(--text-primary)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            {isStockLimit ? (
              <Lock className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1">
            <h2
              id="login-modal-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]"
            >
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
              {description}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-semibold rounded-md flex items-center justify-center space-x-2.5 transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            {/* Google Icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-[11px] font-medium text-[var(--text-muted)]">
            {supportingText}
          </p>
        </div>
      </div>
    </div>
  );
}
