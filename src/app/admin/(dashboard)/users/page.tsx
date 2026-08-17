import { requireSuperAdmin } from "@/lib/cms/auth";
import { listCmsUsers } from "@/lib/cms/user-service";
import { UserManagementClient } from "./UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentAdmin = await requireSuperAdmin();
  const users = await listCmsUsers();

  return (
    <div className="space-y-6">
      <UserManagementClient users={users} currentAdminId={currentAdmin.id} />
    </div>
  );
}
