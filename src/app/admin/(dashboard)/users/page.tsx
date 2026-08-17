import { requireSuperAdmin } from "@/lib/cms/auth";
import { listCmsUsers } from "@/lib/cms/user-service";
import { getAuthors } from "@/lib/cms/service";
import { UserManagementClient } from "./UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentAdmin = await requireSuperAdmin();
  const [users, authors] = await Promise.all([
    listCmsUsers(),
    getAuthors(true),
  ]);

  return (
    <div className="space-y-6">
      <UserManagementClient
        users={users}
        authors={authors}
        currentAdminId={currentAdmin.id}
      />
    </div>
  );
}
