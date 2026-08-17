"use client";

import { useState } from "react";
import { Author, CmsUser, CmsUserRole } from "@/lib/cms/types";
import {
  updateUserStatusAction,
  deleteUserAction,
} from "@/lib/cms/user-actions";
import {
  ShieldCheck,
  Shield,
  Edit3,
  Feather,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface UserManagementTableProps {
  users: CmsUser[];
  authors: Author[];
  currentAdminId: string;
  onEditUser: (user: CmsUser) => void;
  onUserDeleted: (userId: string) => void;
  onUserStatusToggled: (userId: string, newStatus: boolean) => void;
}

export function UserManagementTable({
  users,
  currentAdminId,
  onEditUser,
  onUserDeleted,
  onUserStatusToggled,
}: UserManagementTableProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<CmsUser | null>(null);

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    setActionError(null);
    setLoadingUserId(userId);
    const nextStatus = !currentStatus;
    try {
      const res = await updateUserStatusAction(userId, nextStatus);
      if (res.success) {
        onUserStatusToggled(userId, nextStatus);
      } else {
        setActionError(res.error || "Failed to update user status.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status.";
      setActionError(message);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setActionError(null);
    setLoadingUserId(deletingUser.id);
    try {
      const res = await deleteUserAction(deletingUser.id);
      if (res.success) {
        onUserDeleted(deletingUser.id);
        setDeletingUser(null);
      } else {
        setActionError(res.error || "Failed to delete user.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete user.";
      setActionError(message);
    } finally {
      setLoadingUserId(null);
    }
  };

  const getRoleBadge = (role: CmsUserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-3 h-3 text-amber-500" />
            <span>SUPER_ADMIN</span>
          </span>
        );
      case "EDITOR":
        return (
          <span className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-[var(--accent-teal)] border border-teal-500/20">
            <Shield className="w-3 h-3 text-[var(--accent-teal)]" />
            <span>EDITOR</span>
          </span>
        );
      case "AUTHOR":
        return (
          <span className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Edit3 className="w-3 h-3 text-blue-400" />
            <span>AUTHOR</span>
          </span>
        );
      case "CONTRIBUTOR":
        return (
          <span className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
            <Feather className="w-3 h-3 text-neutral-400" />
            <span>CONTRIBUTOR</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Author Profile</th>
                <th className="py-3 px-4">Public Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
              {users.map((user) => {
                const isSelf = user.id === currentAdminId;
                const isBusy = loadingUserId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    {/* 1. User Account Info */}
                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="flex items-center space-x-3">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="w-7 h-7 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-[10px] text-[var(--accent-teal)] uppercase shrink-0">
                            {(user.name || user.email).charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-[var(--text-primary)] truncate">
                              {user.name || "User"}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-[var(--text-secondary)] truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. CMS Role */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* 3. Author Profile */}
                    <td className="py-3 px-4 min-w-[170px]">
                      {user.author_name ? (
                        <div className="flex items-center space-x-2">
                          {user.author_avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.author_avatar}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] text-[9px] font-bold flex items-center justify-center shrink-0">
                              {user.author_name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-[var(--text-primary)] truncate">
                              {user.author_name}
                            </div>
                            {user.author_slug && (
                              <div className="font-mono text-[10px] text-[var(--text-muted)] truncate">
                                @{user.author_slug}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 italic">
                          No profile linked
                        </span>
                      )}
                    </td>

                    {/* 4. Public Title */}
                    <td className="py-3 px-4 max-w-[200px] truncate text-[var(--text-secondary)]">
                      {user.author_role ? (
                        <span className="font-medium text-[var(--text-primary)]">
                          {user.author_role}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    {/* 5. Status Toggle */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isSelf || isBusy}
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                          user.is_active
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:opacity-80"
                            : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:opacity-80"
                        } ${isSelf ? "cursor-default opacity-80" : "cursor-pointer"}`}
                        title={isSelf ? "You cannot deactivate yourself" : "Click to toggle status"}
                      >
                        {user.is_active ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{user.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    {/* 6. Last Login */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[var(--text-secondary)]">
                      {user.last_login_at ? (
                        new Date(user.last_login_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      ) : (
                        <span className="flex items-center space-x-1 text-[var(--text-muted)]">
                          <Clock className="w-3 h-3" />
                          <span>Never</span>
                        </span>
                      )}
                    </td>

                    {/* 7. Created Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[var(--text-secondary)]">
                      {new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* 8. Actions (Unified Edit & Delete) */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-teal)] ml-auto" />
                      ) : (
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            className="p-1.5 rounded-md hover:bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Edit User & Author Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => setDeletingUser(user)}
                              className="p-1.5 rounded-md hover:bg-red-500/10 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete User Access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Remove User Access?
              </h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to remove CMS access for{" "}
              <strong className="text-[var(--text-primary)]">
                {deletingUser.name ? `${deletingUser.name} (${deletingUser.email})` : deletingUser.email}
              </strong>?
              {deletingUser.author_name && (
                <span className="block mt-2 text-amber-500 font-medium">
                  Note: The linked author profile ({deletingUser.author_name}) and its articles will remain preserved in the database.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-3.5 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-base)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementTable;
