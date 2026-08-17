import { requireAdmin } from "@/lib/cms/auth";
import { getCategories } from "@/lib/cms/service";
import { canViewCategories } from "@/lib/cms/permissions";
import { CategoryManagementView } from "@/components/admin/CategoryManagementView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const user = await requireAdmin();

  if (!canViewCategories(user)) {
    redirect("/admin/articles?error=unauthorized");
  }

  const categories = await getCategories(true);

  return <CategoryManagementView initialCategories={categories} currentUser={user} />;
}
