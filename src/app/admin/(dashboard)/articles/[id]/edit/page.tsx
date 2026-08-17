import { requireCmsUser } from "@/lib/cms/auth";
import { getAdminArticleById, getAuthors, getCategories } from "@/lib/cms/service";
import { canEditArticle } from "@/lib/cms/permissions";
import { ArticleEditorForm } from "@/components/admin/ArticleEditorForm";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage(props: Props) {
  const user = await requireCmsUser();
  const params = await props.params;
  const id = params.id;

  const [article, categories, authors] = await Promise.all([
    getAdminArticleById(id),
    getCategories(),
    getAuthors(),
  ]);

  if (!article) {
    return notFound();
  }

  // Server-side RBAC check for article edit permission
  if (!canEditArticle(user, article)) {
    redirect("/admin/articles?error=unauthorized");
  }

  return (
    <ArticleEditorForm
      initialArticle={article}
      categories={categories}
      authors={authors}
      userRole={user.role}
    />
  );
}
