"use client";

import { useState } from "react";
import { CmsUser, CmsUserRole } from "@/lib/cms/types";
import {
  updateUserRoleAction,
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
} from "lucide-react";

interface UserManagementTableProps {
  users: CmsUser[];
  currentAdminId: string;
}

export function UserManagementTable({ users, currentAdminId }: UserManagementTableProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: CmsUserRole) => {
    setActionError(null);
    setLoadingUserId(userId);
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (!res.success) {
        setActionError(res.error || "Failed to update user role.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update role.";
      setActionError(message);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    setActionError(null);
    setLoadingUserId(userId);
    try {
      const res = await updateUserStatusAction(userId, !currentStatus);
      if (!res.success) {
        setActionError(res.error || "Failed to update user status.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status.";
      setActionError(message);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently remove access for ${email}?`)) {
      return;
    }
    setActionError(null);
    setLoadingUserId(userId);
    try {
      const res = await deleteUserAction(userId);
      if (!res.success) {
        setActionError(res.error || "Failed to delete user.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete user.";
      setActionError(message);
    } finally {
      setLoadingUserId(null);
    }
  };

  const getRoleIcon = (role: CmsUserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />;
      case "EDITOR":
        return <Shield className="w-3.5 h-3.5 text-[var(--accent-teal)]" />;
      case "AUTHOR":
        return <Edit3 className="w-3.5 h-3.5 text-blue-400" />;
      case "CONTRIBUTOR":
        return <Feather className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400">
          {actionError}
        </div>
      )}

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Last Login</th>
                <th className="py-3 px-4 font-semibold">Created</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
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
                    {/* User Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="w-7 h-7 rounded-full object-cover border border-[var(--border-subtle)]"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-[10px] text-[var(--accent-teal)] uppercase">
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

                    {/* Role Dropdown / Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        {getRoleIcon(user.role)}
                        {isSelf ? (
                          <span className="font-semibold font-mono text-[11px] uppercase tracking-wider text-amber-500">
                            {user.role}
                          </span>
                        ) : (
                          <select
                            disabled={isBusy}
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as CmsUserRole)
                            }
                            className="px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-[11px] font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                          >
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="AUTHOR">AUTHOR</option>
                            <option value="CONTRIBUTOR">CONTRIBUTOR</option>
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4">
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

                    {/* Last Login */}
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {user.last_login_at ? (
                        new Date(user.last_login_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="flex items-center space-x-1 text-[var(--text-muted)]">
                          <Clock className="w-3 h-3" />
                          <span>Never</span>
                        </span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      {new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-teal)] ml-auto" />
                      ) : !isSelf ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id, user.email)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove User Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagementTable;
