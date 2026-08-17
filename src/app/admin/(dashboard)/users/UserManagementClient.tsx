"use client";

import { useState } from "react";
import { Author, CmsUser } from "@/lib/cms/types";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { Users, UserPlus } from "lucide-react";

interface UserManagementClientProps {
  users: CmsUser[];
  authors: Author[];
  currentAdminId: string;
}

export function UserManagementClient({
  users,
  authors,
  currentAdminId,
}: UserManagementClientProps) {
  const [usersList, setUsersList] = useState<CmsUser[]>(users);
  const [authorsList, setAuthorsList] = useState<Author[]>(authors);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CmsUser | null>(null);

  const handleEditClick = (user: CmsUser) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: CmsUser) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    // If author was created or updated, update authorsList as well
    if (updatedUser.author_id && updatedUser.author_name) {
      setAuthorsList((prev) => {
        const idx = prev.findIndex((a) => a.id === updatedUser.author_id);
        const updatedAuthorObj: Author = {
          id: updatedUser.author_id!,
          name: updatedUser.author_name!,
          slug: updatedUser.author_slug || "",
          role: updatedUser.author_role || "",
          bio: updatedUser.author_bio || null,
          avatar_url: updatedUser.author_avatar || null,
          is_active: updatedUser.author_is_active !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          article_count: updatedUser.author_article_count ?? 0,
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedAuthorObj;
          return next;
        } else {
          return [...prev, updatedAuthorObj];
        }
      });
    }
  };

  const handleUserCreated = (newUser: CmsUser) => {
    setUsersList((prev) => [newUser, ...prev]);
    if (newUser.author_id && newUser.author_name) {
      setAuthorsList((prev) => [
        ...prev,
        {
          id: newUser.author_id!,
          name: newUser.author_name!,
          slug: newUser.author_slug || "",
          role: newUser.author_role || "",
          bio: newUser.author_bio || null,
          avatar_url: newUser.author_avatar || null,
          is_active: newUser.author_is_active !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          article_count: 0,
        },
      ]);
    }
  };

  const handleUserDeleted = (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUserStatusToggled = (userId: string, newStatus: boolean) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: newStatus } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[var(--accent-teal)]" />
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              CMS Users & Author Management
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Unified management for authorized CMS staff, editorial roles, and public author profiles.
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
      <UserManagementTable
        users={usersList}
        authors={authorsList}
        currentAdminId={currentAdminId}
        onEditUser={handleEditClick}
        onUserDeleted={handleUserDeleted}
        onUserStatusToggled={handleUserStatusToggled}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        user={editingUser}
        allAuthors={authorsList}
        allUsers={usersList}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onUserUpdated={handleUserUpdated}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        allAuthors={authorsList}
        allUsers={usersList}
        onClose={() => setIsAddModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}

export default UserManagementClient;
