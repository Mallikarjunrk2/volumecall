import { requireAdmin } from "@/lib/cms/auth";
import { canViewCategories } from "@/lib/cms/permissions";
import Link from "next/link";
import { signOut } from "@/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  FileText,
  PlusCircle,
  LayoutDashboard,
  ExternalLink,
  LogOut,
  Users,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* ─── Admin Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[var(--bg-base)]/95 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Brand & Section Title */}
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="flex items-center space-x-2.5">
              <svg
                viewBox="0 0 200 200"
                className="h-4.5 w-4.5 shrink-0 fill-[#0A0A0A] dark:fill-[#FFFFFF] transition-colors"
                aria-hidden="true"
              >
                <rect x="40" y="44" width="36" height="50" rx="11" />
                <rect x="76" y="100" width="36" height="50" rx="11" />
                <rect x="128" y="44" width="36" height="106" rx="11" />
              </svg>
              <span className="text-sm font-bold tracking-tight uppercase">
                VolumeCall CMS
              </span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-3 text-xs font-medium">
              <Link
                href="/admin"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/articles"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Articles</span>
              </Link>
              <Link
                href="/admin/articles/new"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-[#0D9488] dark:text-[#2DD4BF] hover:bg-[#0D9488]/10 transition-colors font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Article</span>
              </Link>
              {canViewCategories(admin) && (
                <Link
                  href="/admin/categories"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Categories</span>
                </Link>
              )}
              {admin.role === "SUPER_ADMIN" && (
                <Link
                  href="/admin/users"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Tools & User Profile */}
          <div className="flex items-center space-x-3">
            <Link
              href="/blog"
              target="_blank"
              className="hidden md:flex items-center space-x-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mr-2"
            >
              <span>View Public Blog</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <ThemeToggle />

            {/* Admin Badge */}
            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              <div className="flex flex-col items-end">
                <span className="font-mono text-[11px] truncate max-w-[150px]">
                  {admin.email}
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--accent-teal)]">
                  {admin.role.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Sign Out Form */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center space-x-1 text-xs px-2.5 py-1.5 border border-[var(--border-subtle)] hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ──────────────────────────────────────── */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
