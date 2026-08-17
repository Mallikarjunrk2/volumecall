"use client";

import { useState } from "react";
import { CmsUser } from "@/lib/cms/types";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { Users, UserPlus } from "lucide-react";

interface UserManagementClientProps {
  users: CmsUser[];
  currentAdminId: string;
}

export function UserManagementClient({ users, currentAdminId }: UserManagementClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[var(--accent-teal)]" />
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              CMS User Management
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage authorized staff, assign role-based editorial permissions, and monitor access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-[var(--accent-teal)] hover:opacity-90 text-white font-medium text-xs shadow-xs transition-opacity shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <UserManagementTable users={users} currentAdminId={currentAdminId} />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

export default UserManagementClient;
