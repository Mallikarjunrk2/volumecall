"use client";

import { useState } from "react";
import { ArticleCategory, ArticleCategoryInput, CmsUser } from "@/lib/cms/types";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
} from "@/lib/cms/category-actions";
import {
  canCreateCategory,
  canEditCategory,
  canDeleteCategory,
} from "@/lib/cms/permissions";
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderTree,
  AlertTriangle,
  Loader2,
  Layers,
  FileText,
} from "lucide-react";

interface Props {
  initialCategories: ArticleCategory[];
  currentUser?: CmsUser | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryManagementView({ initialCategories, currentUser }: Props) {
  const [categories, setCategories] = useState<ArticleCategory[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);

  const canCreate = canCreateCategory(currentUser ?? null);
  const canEdit = canEditCategory(currentUser ?? null);
  const canDelete = canDeleteCategory(currentUser ?? null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete / Reassign Modal State
  const [deletingCategory, setDeletingCategory] = useState<ArticleCategory | null>(null);
  const [reassignCategoryId, setReassignCategoryId] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setAutoSlug(true);
    setDescription("");
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: ArticleCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setAutoSlug(false);
    setDescription(cat.description || "");
    setSortOrder(cat.sort_order || 0);
    setIsActive(cat.is_active !== false);
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
    if (!name.trim() || !slug.trim()) {
      setFormError("Category Name and Slug are required.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload: ArticleCategoryInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    try {
      if (editingCategory) {
        const res = await updateCategoryAction(editingCategory.id, payload);
        if (res.success && res.category) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? { ...res.category!, article_count: c.article_count } : c))
          );
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to update category.");
        }
      } else {
        const res = await createCategoryAction(payload);
        if (res.success && res.category) {
          setCategories((prev) => [...prev, { ...res.category!, article_count: 0 }]);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to create category.");
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cat: ArticleCategory) => {
    const nextState = !cat.is_active;
    try {
      const res = await toggleCategoryActiveAction(cat.id, nextState);
      if (res.success && res.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, is_active: nextState } : c))
        );
      } else {
        alert(res.error || "Failed to toggle category status.");
      }
    } catch {
      alert("Error toggling category status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);

    try {
      const res = await deleteCategoryAction(
        deletingCategory.id,
        reassignCategoryId ? reassignCategoryId : null
      );
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
        setDeletingCategory(null);
        setReassignCategoryId("");
      } else {
        alert(res.error || "Failed to delete category.");
      }
    } catch {
      alert("Error deleting category.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateInstead = async () => {
    if (!deletingCategory) return;
    await handleToggleActive({ ...deletingCategory, is_active: true });
    setDeletingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[var(--accent-teal)] font-mono uppercase tracking-wider font-semibold mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Taxonomy & Content Organization</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Article Categories
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Create, organize, and manage article categories across VolumeCall research.
          </p>
        </div>
        {canCreate && (
          <div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#2DD4BF] dark:hover:bg-[#20D6C2] text-white dark:text-black font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Categories Table ─────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderTree className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
            <p className="text-xs text-[var(--text-secondary)]">
              No categories created yet. Click &ldquo;New Category&rdquo; to create your first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-base)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-medium">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Articles</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[var(--bg-base)] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                      {cat.sort_order ?? 0}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--accent-teal)]">
                      /blog?category={cat.slug}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] max-w-[280px] truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        <FileText className="w-3 h-3 text-[var(--text-muted)]" />
                        <span>{cat.article_count ?? 0}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          className="inline-flex items-center space-x-1 cursor-pointer group"
                          title="Click to toggle status"
                        >
                          {cat.is_active !== false ? (
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
                      ) : (
                        <span className="inline-flex items-center space-x-1">
                          {cat.is_active !== false ? (
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
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canEdit || canDelete ? (
                        <div className="inline-flex items-center space-x-1.5">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => openEditModal(cat)}
                              className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeletingCategory(cat)}
                              className="p-1.5 rounded-md hover:bg-red-500/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          Read only
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create / Edit Category Modal ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {editingCategory ? "Edit Category" : "New Category"}
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
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Valuation & Models"
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    URL Slug <span className="text-red-500">*</span>
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
                  <span className="text-xs text-[var(--text-muted)] font-mono">/blog?category=</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(e.target.value);
                    }}
                    placeholder="valuation-models"
                    className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Articles covering stock valuation methods, multiples, and intrinsic value estimation."
                  className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>

              {/* Sort Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Category Status
                  </label>
                  <select
                    value={isActive ? "active" : "inactive"}
                    onChange={(e) => setIsActive(e.target.value === "active")}
                    className="w-full px-3 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  >
                    <option value="active">Active (Visible in CMS & Blog)</option>
                    <option value="inactive">Inactive (Hidden from selectors)</option>
                  </select>
                </div>
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
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Safe Delete Category Modal ───────────────────────────────────── */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Delete Category: {deletingCategory.name}?
              </h3>
            </div>

            {(deletingCategory.article_count ?? 0) > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  This category is currently linked to{" "}
                  <strong className="text-[var(--text-primary)]">{deletingCategory.article_count}</strong>{" "}
                  article(s). Reassign them to another category to preserve article taxonomy, or deactivate the category instead.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Reassign Articles To:
                  </label>
                  <select
                    value={reassignCategoryId}
                    onChange={(e) => setReassignCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                  >
                    <option value="">Unassigned (Set category to null)</option>
                    {categories
                      .filter((c) => c.id !== deletingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to permanently delete this category? This action cannot be undone.
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {(deletingCategory.article_count ?? 0) > 0 && (
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
                <span>{(deletingCategory.article_count ?? 0) > 0 ? "Reassign & Delete" : "Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManagementView;
