"use client";

import { useState } from "react";
import { Author, AuthorInput } from "@/lib/cms/types";
import {
  createAuthorAction,
  updateAuthorAction,
  deleteAuthorAction,
  toggleAuthorActiveAction,
} from "@/lib/cms/author-actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Users,
  FileText,
  UserCheck,
} from "lucide-react";

interface Props {
  initialAuthors: Author[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AuthorManagementView({ initialAuthors }: Props) {
  const [authors, setAuthors] = useState<Author[]>(initialAuthors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete / Reassign Modal State
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);
  const [reassignAuthorId, setReassignAuthorId] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingAuthor(null);
    setName("");
    setSlug("");
    setAutoSlug(true);
    setRole("Equity Research & Financial Analysis");
    setBio("");
    setAvatarUrl("");
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (author: Author) => {
    setEditingAuthor(author);
    setName(author.name);
    setSlug(author.slug);
    setAutoSlug(false);
    setRole(author.role || "Financial Analyst");
    setBio(author.bio || "");
    setAvatarUrl(author.avatar_url || "");
    setIsActive(author.is_active !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !role.trim()) {
      setFormError("Author Name, Slug, and Professional Role / Title are required.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload: AuthorInput = {
      name: name.trim(),
      slug: slug.trim(),
      role: role.trim(),
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      is_active: isActive,
    };

    try {
      if (editingAuthor) {
        const res = await updateAuthorAction(editingAuthor.id, payload);
        if (res.success && res.author) {
          setAuthors((prev) =>
            prev.map((a) => (a.id === editingAuthor.id ? { ...res.author!, article_count: a.article_count } : a))
          );
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to update author profile.");
        }
      } else {
        const res = await createAuthorAction(payload);
        if (res.success && res.author) {
          setAuthors((prev) => [...prev, { ...res.author!, article_count: 0 }]);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to create author profile.");
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (author: Author) => {
    const nextState = !author.is_active;
    try {
      const res = await toggleAuthorActiveAction(author.id, nextState);
      if (res.success && res.author) {
        setAuthors((prev) =>
          prev.map((a) => (a.id === author.id ? { ...a, is_active: nextState } : a))
        );
      } else {
        alert(res.error || "Failed to toggle author status.");
      }
    } catch {
      alert("Error toggling author status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAuthor) return;
    setIsDeleting(true);

    try {
      const res = await deleteAuthorAction(
        deletingAuthor.id,
        reassignAuthorId ? reassignAuthorId : null
      );
      if (res.success) {
        setAuthors((prev) => prev.filter((a) => a.id !== deletingAuthor.id));
        setDeletingAuthor(null);
        setReassignAuthorId("");
      } else {
        alert(res.error || "Failed to delete author profile.");
      }
    } catch {
      alert("Error deleting author profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateInstead = async () => {
    if (!deletingAuthor) return;
    await handleToggleActive({ ...deletingAuthor, is_active: true });
    setDeletingAuthor(null);
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[var(--accent-teal)] font-mono uppercase tracking-wider font-semibold mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Editorial Profiles & Bylines</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Author Profiles
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Manage public author identities, professional titles, bios, and profile images rendered on published articles.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#2DD4BF] dark:hover:bg-[#20D6C2] text-white dark:text-black font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Author Profile</span>
          </button>
        </div>
      </div>

      {/* ─── Authors Table ───────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        {authors.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
            <p className="text-xs text-[var(--text-secondary)]">
              No author profiles found. Click &ldquo;New Author Profile&rdquo; to create your first author.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-base)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-medium">
                <tr>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Professional Title / Role</th>
                  <th className="py-3 px-4">Bio</th>
                  <th className="py-3 px-4 text-center">Articles</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {authors.map((author) => (
                  <tr key={author.id} className="hover:bg-[var(--bg-base)] transition-colors">
                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="flex items-center space-x-3">
                        {author.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={author.avatar_url}
                            alt={author.name}
                            className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 flex items-center justify-center text-[var(--accent-teal)] font-bold text-xs shrink-0">
                            {author.name ? author.name[0] : "A"}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">
                            {author.name}
                          </div>
                          <div className="font-mono text-[10px] text-[var(--text-muted)]">
                            @{author.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--accent-teal)] max-w-[220px]">
                      {author.role}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] max-w-[300px] truncate">
                      {author.bio || "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        <FileText className="w-3 h-3 text-[var(--text-muted)]" />
                        <span>{author.article_count ?? 0}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(author)}
                        className="inline-flex items-center space-x-1 cursor-pointer group"
                        title="Click to toggle status"
                      >
                        {author.is_active !== false ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-500/10 text-neutral-500 border border-neutral-500/20">
                            <XCircle className="w-3 h-3" />
                            <span>INACTIVE</span>
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(author)}
                          className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          title="Edit Author Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingAuthor(author)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Author Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create / Edit Author Modal ───────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingAuthor ? "Edit Author Profile" : "New Author Profile"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. VolumeCall Research or Dr. Rahul Sharma"
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Profile Slug <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[11px] text-[var(--accent-teal)] hover:underline cursor-pointer"
                  >
                    {autoSlug ? "Manual Slug" : "Auto Slug"}
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-[var(--text-muted)] font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(e.target.value);
                    }}
                    placeholder="volumecall-research"
                    className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  />
                </div>
              </div>

              {/* Professional Title / Role */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Public Role / Professional Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Equity Research & Quantitative Analysis"
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
                <p className="text-[10px] text-[var(--text-muted)]">
                  This title appears under the author&apos;s name on public articles.
                </p>
              </div>

              {/* Short Bio */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Short Biography
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Independent research and quantitative analysis covering Indian equities, valuation models, and financial statements."
                  className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>

              {/* Avatar / Profile Image */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Profile Image / Avatar
                </label>
                <ImageUploader
                  value={avatarUrl}
                  onChange={(url) => setAvatarUrl(url)}
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Author Profile Status
                </label>
                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                >
                  <option value="active">Active (Available in article author selector)</option>
                  <option value="inactive">Inactive (Hidden from new articles)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#2DD4BF] dark:hover:bg-[#20D6C2] text-white dark:text-black font-semibold text-xs rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAuthor ? "Save Changes" : "Create Author Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Safe Delete Author Modal ─────────────────────────────────────── */}
      {deletingAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Delete Author: {deletingAuthor.name}?
              </h3>
            </div>

            {(deletingAuthor.article_count ?? 0) > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  This author profile is currently attributed to{" "}
                  <strong className="text-[var(--text-primary)]">{deletingAuthor.article_count}</strong>{" "}
                  article(s). Reassign them to another author, or deactivate the profile instead.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Reassign Articles To:
                  </label>
                  <select
                    value={reassignAuthorId}
                    onChange={(e) => setReassignAuthorId(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  >
                    <option value="">Unassigned (Set author to null)</option>
                    {authors
                      .filter((a) => a.id !== deletingAuthor.id)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to permanently delete this author profile? This action cannot be undone.
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setDeletingAuthor(null)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {(deletingAuthor.article_count ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={handleDeactivateInstead}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs font-semibold text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/10 transition-colors cursor-pointer"
                >
                  Deactivate Instead
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{(deletingAuthor.article_count ?? 0) > 0 ? "Reassign & Delete" : "Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorManagementView;
