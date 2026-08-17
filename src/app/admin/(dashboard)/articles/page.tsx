import { requireCmsUser } from "@/lib/cms/auth";
import { getAdminArticles } from "@/lib/cms/service";
import { AdminArticlesView } from "@/components/admin/AdminArticlesView";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminArticlesPage(props: Props) {
  const user = await requireCmsUser();
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status || "ALL";
  const articles = await getAdminArticles(statusFilter);

  return (
    <AdminArticlesView
      initialArticles={articles}
      initialStatus={statusFilter}
      currentUser={user}
    />
  );
}
