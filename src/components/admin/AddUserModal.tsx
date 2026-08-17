"use client";

import { useState } from "react";
import { createUserAction } from "@/lib/cms/user-actions";
import { CmsUserRole } from "@/lib/cms/types";
import { X, UserPlus, Loader2 } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<CmsUserRole>("AUTHOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("role", role);

      const res = await createUserAction(formData);
      if (res.success) {
        setEmail("");
        setName("");
        setRole("AUTHOR");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-[var(--accent-teal)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Add CMS User</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

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
              className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
            />
            <p className="text-[11px] text-[var(--text-muted)]">
              The user will authenticate through Google OAuth using this email.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[var(--text-primary)]">
              Full Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[var(--text-primary)]">
              Assigned CMS Role <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CmsUserRole)}
              className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
            >
              <option value="EDITOR">Editor (Can create, edit, review & publish all articles)</option>
              <option value="AUTHOR">Author (Can create and edit own articles; cannot publish)</option>
              <option value="CONTRIBUTOR">Contributor (Can draft own articles only; cannot publish)</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded bg-[var(--accent-teal)] hover:opacity-90 text-white font-semibold transition-opacity disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Add User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
