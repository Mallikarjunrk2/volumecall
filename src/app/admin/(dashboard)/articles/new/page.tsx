import { requireCmsUser } from "@/lib/cms/auth";
import { getAuthors, getCategories } from "@/lib/cms/service";
import { ArticleEditorForm } from "@/components/admin/ArticleEditorForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const user = await requireCmsUser();
  const [categories, authors] = await Promise.all([
    getCategories(),
    getAuthors(),
  ]);

  return (
    <ArticleEditorForm
      categories={categories}
      authors={authors}
      userRole={user.role}
      currentUser={user}
    />
  );
}
