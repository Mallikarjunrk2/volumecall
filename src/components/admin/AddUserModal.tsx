"use client";

import { useState } from "react";
import { Author, CmsUser, CmsUserRole, UnifiedUserInput } from "@/lib/cms/types";
import { createUnifiedUserAction } from "@/lib/cms/user-actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  X,
  UserPlus,
  ShieldCheck,
  Feather,
  Loader2,
  AlertTriangle,
  Link2,
  Unlink,
} from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  allAuthors?: Author[];
  allUsers?: CmsUser[];
  onClose: () => void;
  onUserCreated?: (newUser: CmsUser) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AddUserModal({
  isOpen,
  allAuthors = [],
  allUsers = [],
  onClose,
  onUserCreated,
}: AddUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<CmsUserRole>("CONTRIBUTOR");

  // Author Profile Mode
  const [authorMode, setAuthorMode] = useState<"NONE" | "CREATE_NEW" | "LINK_EXISTING">("NONE");
  const [existingAuthorId, setExistingAuthorId] = useState("");

  // Author Profile Fields (Never auto-fabricated!)
  const [authorName, setAuthorName] = useState("");
  const [authorSlug, setAuthorSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [authorRole, setAuthorRole] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!authorName || authorName === name) {
      setAuthorName(val);
      if (autoSlug) {
        setAuthorSlug(slugify(val));
      }
    }
  };

  const handleAuthorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAuthorName(val);
    if (autoSlug) {
      setAuthorSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: UnifiedUserInput = {
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        role,
        is_active: true,
        author_mode: authorMode,
        existing_author_id: authorMode === "LINK_EXISTING" ? existingAuthorId : undefined,
        author_name: authorMode === "CREATE_NEW" ? authorName.trim() : undefined,
        author_slug: authorMode === "CREATE_NEW" ? authorSlug.trim() : undefined,
        author_role: authorMode === "CREATE_NEW" ? authorRole.trim() : undefined,
        author_bio: authorMode === "CREATE_NEW" ? authorBio.trim() || null : undefined,
        author_avatar: authorMode === "CREATE_NEW" ? authorAvatar.trim() || null : undefined,
        author_is_active: true,
      };

      const res = await createUnifiedUserAction(payload);
      if (res.success && res.user) {
        setEmail("");
        setName("");
        setRole("CONTRIBUTOR");
        setAuthorMode("NONE");
        setExistingAuthorId("");
        setAuthorName("");
        setAuthorSlug("");
        setAuthorRole("");
        setAuthorBio("");
        setAuthorAvatar("");
        if (onUserCreated) {
          onUserCreated(res.user);
        }
        onClose();
      } else {
        setError(res.error || "Failed to create user.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/20">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Add New CMS User
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Create user credentials and configure public author identity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* ─── SECTION 1: ACCOUNT DETAILS ───────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-[var(--border-subtle)]">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-teal)]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                1. Account Credentials & Access
              </h4>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-primary)]">
                Google Account Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@gmail.com"
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
              <p className="text-[10px] text-[var(--text-muted)]">
                The user will authenticate using Google OAuth with this email address.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">
                  CMS Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as CmsUserRole)}
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                >
                  <option value="CONTRIBUTOR">Contributor (Drafts own articles only)</option>
                  <option value="AUTHOR">Author (Can draft & edit own articles)</option>
                  <option value="EDITOR">Editor (Can edit & publish all articles)</option>
                  <option value="SUPER_ADMIN">Super Administrator (Full CMS control)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── SECTION 2: PUBLIC AUTHOR PROFILE ──────────────────────────────── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 pb-2 border-b border-[var(--border-subtle)]">
              <Feather className="w-4 h-4 text-[var(--accent-teal)]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                2. Public Author Profile
              </h4>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-[var(--text-primary)]">
                Configure Public Byline
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthorMode("NONE")}
                  className={`p-2.5 text-left rounded-md border transition-colors cursor-pointer flex flex-col justify-between ${
                    authorMode === "NONE"
                      ? "bg-neutral-500/15 border-neutral-400 text-[var(--text-primary)]"
                      : "bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  <Unlink className="w-4 h-4 text-neutral-400 mb-1" />
                  <span className="font-semibold text-xs">No Profile</span>
                  <span className="text-[10px] text-[var(--text-muted)]">CMS access only</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthorMode("CREATE_NEW");
                    if (!authorName && name) {
                      setAuthorName(name);
                      setAuthorSlug(slugify(name));
                    }
                  }}
                  className={`p-2.5 text-left rounded-md border transition-colors cursor-pointer flex flex-col justify-between ${
                    authorMode === "CREATE_NEW"
                      ? "bg-[var(--accent-teal)]/10 border-[var(--accent-teal)] text-[var(--text-primary)]"
                      : "bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-[var(--accent-teal)] mb-1" />
                  <span className="font-semibold text-xs">New Author</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Create new profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthorMode("LINK_EXISTING")}
                  className={`p-2.5 text-left rounded-md border transition-colors cursor-pointer flex flex-col justify-between ${
                    authorMode === "LINK_EXISTING"
                      ? "bg-[var(--accent-teal)]/10 border-[var(--accent-teal)] text-[var(--text-primary)]"
                      : "bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  <Link2 className="w-4 h-4 text-[var(--accent-teal)] mb-1" />
                  <span className="font-semibold text-xs">Link Existing</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Select author</span>
                </button>
              </div>
            </div>

            {/* Case: LINK_EXISTING */}
            {authorMode === "LINK_EXISTING" && (
              <div className="space-y-1.5 p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md animate-in fade-in">
                <label className="font-semibold text-[var(--text-primary)]">
                  Select Existing Author Profile
                </label>
                <select
                  value={existingAuthorId}
                  onChange={(e) => setExistingAuthorId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                >
                  <option value="">-- Choose Author Profile --</option>
                  {allAuthors.map((a) => {
                    const linkedUser = allUsers.find((u) => u.author_id === a.id);
                    return (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role}){linkedUser ? ` [Linked to: ${linkedUser.name || linkedUser.email}]` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Case: CREATE_NEW */}
            {authorMode === "CREATE_NEW" && (
              <div className="space-y-4 p-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--text-primary)]">
                      Public Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={handleAuthorNameChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-medium text-[var(--text-secondary)]">
                        Profile Slug <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAutoSlug(!autoSlug)}
                        className="text-[10px] text-[var(--accent-teal)] hover:underline cursor-pointer"
                      >
                        {autoSlug ? "Manual Slug" : "Auto Slug"}
                      </button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-[var(--text-muted)] font-mono">@</span>
                      <input
                        type="text"
                        required
                        value={authorSlug}
                        onChange={(e) => {
                          setAutoSlug(false);
                          setAuthorSlug(e.target.value);
                        }}
                        placeholder="rahul-sharma"
                        className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-primary)]">
                    Professional Role / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="e.g. Financial Research Writer"
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  />
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Rendered directly under the author byline on public blog posts.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">
                    Short Biography
                  </label>
                  <textarea
                    rows={2}
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    placeholder="Brief background on financial expertise and research focus."
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-[var(--text-secondary)]">
                    Author Avatar / Profile Image
                  </label>
                  <ImageUploader
                    value={authorAvatar}
                    onChange={(url) => setAuthorAvatar(url)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-base)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-[var(--accent-teal)] hover:opacity-90 text-white font-semibold text-xs shadow-xs transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
