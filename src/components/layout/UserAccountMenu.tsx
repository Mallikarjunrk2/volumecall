"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Bookmark, LogOut, User as UserIcon, ChevronDown } from "lucide-react";

export function UserAccountMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-md transition-colors shadow-xs"
      >
        Log in
      </Link>
    );
  }

  const user = session.user;
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center space-x-1.5 p-1 rounded-full hover:bg-[var(--border-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--border-strong)] transition-colors cursor-pointer"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name || "User Avatar"}
            referrerPolicy="no-referrer"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-[var(--border-subtle)]"
          />
        ) : (
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs">
            {initial}
          </div>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] hidden sm:block" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-lg py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* User Details */}
          <div className="px-3.5 py-2 border-b border-[var(--border-subtle)]">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
              {user.name || "User"}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] truncate font-mono mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/watchlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>My Watchlist</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="pt-1 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
