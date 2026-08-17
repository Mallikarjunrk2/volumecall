"use client";

import { useState } from "react";
import { Author, CmsUser, CmsUserRole, UnifiedUserInput } from "@/lib/cms/types";
import { saveUnifiedUserAction } from "@/lib/cms/user-actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  X,
  UserCheck,
  ShieldCheck,
  Edit3,
  Feather,
  Loader2,
  AlertTriangle,
  FileText,
  Link2,
  UserPlus,
  Unlink,
} from "lucide-react";

interface EditUserModalProps {
  isOpen: boolean;
  user: CmsUser | null;
  allAuthors: Author[];
  allUsers: CmsUser[];
  onClose: () => void;
  onUserUpdated: (updatedUser: CmsUser) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRoleDescription(r: CmsUserRole) {
  switch (r) {
    case "SUPER_ADMIN":
      return "Full administrative access. Can manage all articles, users, categories, and author profiles.";
    case "EDITOR":
      return "Editorial access. Can create, edit, and publish all articles. Cannot manage users or categories.";
    case "AUTHOR":
      return "Author access. Can create and edit articles assigned to their author profile. Cannot publish directly.";
    case "CONTRIBUTOR":
      return "Contributor access. Can create draft articles for their own author profile. Cannot edit other authors' articles or publish.";
  }
}

interface FormInnerProps {
  user: CmsUser;
  allAuthors: Author[];
  allUsers: CmsUser[];
  onClose: () => void;
  onUserUpdated: (updatedUser: CmsUser) => void;
}

function EditUserModalForm({
  user,
  allAuthors,
  allUsers,
  onClose,
  onUserUpdated,
}: FormInnerProps) {
  // Account State initialized synchronously
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState<CmsUserRole>(user.role);
  const [isActive, setIsActive] = useState(user.is_active);

  // Author Profile Mode State initialized synchronously
  const [authorMode, setAuthorMode] = useState<
    "UPDATE_EXISTING" | "CREATE_NEW" | "LINK_EXISTING" | "NONE"
  >(user.author_id ? "UPDATE_EXISTING" : "NONE");
  const [existingAuthorId, setExistingAuthorId] = useState(user.author_id || "");

  // Author Profile Fields initialized synchronously
  const [authorName, setAuthorName] = useState(user.author_name || user.name || "");
  const [authorSlug, setAuthorSlug] = useState(
    user.author_slug || (user.name ? slugify(user.name) : "")
  );
  const [autoSlug, setAutoSlug] = useState(!user.author_id);
  const [authorRole, setAuthorRole] = useState(user.author_role || "");
  const [authorBio, setAuthorBio] = useState(user.author_bio || "");
  const [authorAvatar, setAuthorAvatar] = useState(user.author_avatar || "");
  const [authorIsActive, setAuthorIsActive] = useState(user.author_is_active !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAuthorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAuthorName(val);
    if (autoSlug) {
      setAuthorSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      const payload: UnifiedUserInput = {
        id: user.id,
        email: user.email,
        name: name.trim() || null,
        role,
        is_active: isActive,
        author_mode: authorMode,
        existing_author_id: authorMode === "LINK_EXISTING" ? existingAuthorId : undefined,
        author_name: authorName.trim() || undefined,
        author_slug: authorSlug.trim() || undefined,
        author_role: authorRole.trim() || undefined,
        author_bio: authorBio.trim() || null,
        author_avatar: authorAvatar.trim() || null,
        author_is_active: authorIsActive,
      };

      const res = await saveUnifiedUserAction(payload);
      if (res.success && res.user) {
        onUserUpdated(res.user);
        onClose();
      } else {
        setFormError(res.error || "Failed to save user updates.");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden my-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/20">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Edit User & Author Profile
            </h3>
            <p className="text-[11px] font-mono text-[var(--text-muted)]">
              {user.email}
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
      {formError && (
        <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[calc(85vh-120px)] overflow-y-auto">
        {/* ─── SECTION 1: ACCOUNT & ACCESS ──────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[var(--border-subtle)]">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-teal)]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              1. Account & Access
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-primary)]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mallikarjun Kanade"
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-secondary)]">
                Google Account Email
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-muted)] cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-primary)]">
                CMS Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CmsUserRole)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Control)</option>
                <option value="EDITOR">EDITOR (Publish & Edit All)</option>
                <option value="AUTHOR">AUTHOR (Edit Own Articles)</option>
                <option value="CONTRIBUTOR">CONTRIBUTOR (Draft Own Only)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-primary)]">
                Account Status
              </label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
              >
                <option value="active">Active (Permitted to log in)</option>
                <option value="inactive">Inactive (Access suspended)</option>
              </select>
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-[11px] text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">Permission Level: </span>
            {getRoleDescription(role)}
          </div>
        </div>

        {/* ─── SECTION 2: PUBLIC AUTHOR PROFILE ──────────────────────────────── */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center space-x-2">
              <Feather className="w-4 h-4 text-[var(--accent-teal)]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                2. Public Author Profile
              </h4>
            </div>
            {user.author_article_count !== undefined && user.author_article_count > 0 && (
              <span className="inline-flex items-center space-x-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/20">
                <FileText className="w-3 h-3" />
                <span>{user.author_article_count} Published Articles</span>
              </span>
            )}
          </div>

          {/* Author Profile Action Modes */}
          <div className="space-y-2">
            <label className="font-semibold text-[var(--text-primary)]">
              Author Profile Link
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {user.author_id && (
                <button
                  type="button"
                  onClick={() => setAuthorMode("UPDATE_EXISTING")}
                  className={`p-2.5 text-left rounded-md border transition-colors cursor-pointer flex items-center space-x-2 ${
                    authorMode === "UPDATE_EXISTING"
                      ? "bg-[var(--accent-teal)]/10 border-[var(--accent-teal)] text-[var(--text-primary)]"
                      : "bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-[var(--accent-teal)] shrink-0" />
                  <div>
                    <div className="font-semibold text-xs">Edit Linked Profile</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[190px]">
                      {user.author_name || "Current author profile"}
                    </div>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setAuthorMode("CREATE_NEW")}
                className={`p-2.5 text-left rounded-md border transition-colors cursor-pointer flex items-center space-x-2 ${
                  authorMode === "CREATE_NEW"
                    ? "bg-[var(--accent-teal)]/10 border-[var(--accent-teal)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-[var(--accent-teal)] shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Create New Profile</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Create a dedicated byline for this user
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAuthorMode("LINK_EXISTING")}
                className={`p-2.5 text-left rounded-md border transition-colors cursor-pointer flex items-center space-x-2 ${
                  authorMode === "LINK_EXISTING"
                    ? "bg-[var(--accent-teal)]/10 border-[var(--accent-teal)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-[var(--accent-teal)] shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Link Existing Author</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Connect to an already created profile
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAuthorMode("NONE")}
                className={`p-2.5 text-left rounded-md border transition-colors cursor-pointer flex items-center space-x-2 ${
                  authorMode === "NONE"
                    ? "bg-amber-500/10 border-amber-500 text-[var(--text-primary)]"
                    : "bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                <Unlink className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">No Author Profile</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    User has no public articles or byline
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Case 1: LINK_EXISTING */}
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
                  const linkedUser = allUsers.find(
                    (u) => u.author_id === a.id && u.id !== user.id
                  );
                  return (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role}){linkedUser ? ` [Linked to: ${linkedUser.name || linkedUser.email}]` : ""}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-[var(--text-muted)]">
                All future articles created by this user will be published under this selected author.
              </p>
            </div>
          )}

          {/* Case 2: CREATE_NEW or UPDATE_EXISTING */}
          {(authorMode === "CREATE_NEW" || authorMode === "UPDATE_EXISTING") && (
            <div className="space-y-4 p-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-primary)]">
                    Public Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={handleAuthorNameChange}
                    placeholder="e.g. VolumeCall Research"
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  />
                </div>

                {/* Slug */}
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
                      placeholder="volumecall-research"
                      className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Title */}
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">
                  Professional Role / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="e.g. Quantitative Financial Analyst"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
                <p className="text-[10px] text-[var(--text-muted)]">
                  Rendered directly under the author byline on public blog posts.
                </p>
              </div>

              {/* Biography */}
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">
                  Short Biography
                </label>
                <textarea
                  rows={3}
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Brief background on financial expertise, market focus, and quantitative analysis experience."
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>

              {/* Avatar */}
              <div className="space-y-1.5">
                <label className="font-medium text-[var(--text-secondary)]">
                  Author Avatar / Profile Image
                </label>
                <ImageUploader
                  value={authorAvatar}
                  onChange={(url) => setAuthorAvatar(url)}
                />
              </div>

              {/* Author Active Status */}
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">
                  Author Profile Status
                </label>
                <select
                  value={authorIsActive ? "active" : "inactive"}
                  onChange={(e) => setAuthorIsActive(e.target.value === "active")}
                  className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                >
                  <option value="active">Active (Available for article attribution)</option>
                  <option value="inactive">Inactive (Hidden from active publishing)</option>
                </select>
              </div>
            </div>
          )}

          {/* Case 3: NONE */}
          {authorMode === "NONE" && (
            <div className="p-3 bg-neutral-500/10 border border-neutral-500/20 rounded-md text-[11px] text-[var(--text-muted)]">
              This user will not have a linked public author profile. If they are a CONTRIBUTOR, they will see a notice in the article editor to link an author profile before publishing.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-base)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-[var(--accent-teal)] hover:opacity-90 text-white font-semibold text-xs shadow-xs transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save User & Author</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditUserModal(props: EditUserModalProps) {
  if (!props.isOpen || !props.user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <EditUserModalForm
        key={props.user.id}
        user={props.user}
        allAuthors={props.allAuthors}
        allUsers={props.allUsers}
        onClose={props.onClose}
        onUserUpdated={props.onUserUpdated}
      />
    </div>
  );
}

export default EditUserModal;
