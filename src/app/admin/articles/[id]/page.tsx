import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseBlocks } from "@/lib/blocks";
import ArticleForm from "./ArticleForm";

export const metadata: Metadata = { title: "Article — back-office", robots: { index: false } };

export default async function AdminArticleEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "nouveau";

  const [article, categories] = await Promise.all([
    isNew ? null : db.article.findUnique({ where: { id: Number(id) } }),
    db.articleCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!isNew && !article) notFound();

  // Objet intermédiaire : les colonnes nullables deviennent des chaînes pour que
  // les champs restent contrôlés, et bodyBlocks est typé avant le formulaire.
  const formArticle = article
    ? {
        id: article.id,
        slug: article.slug,
        title: article.title,
        dek: article.dek,
        eyebrow: article.eyebrow ?? "",
        categoryId: article.categoryId,
        heroImageUrl: article.heroImageUrl ?? "",
        heroImageAlt: article.heroImageAlt ?? "",
        disclaimerText: article.disclaimerText ?? "",
        seoTitle: article.seoTitle ?? "",
        seoDescription: article.seoDescription ?? "",
        featured: article.featured,
        published: article.published,
        bodyBlocks: parseBlocks(article.bodyBlocks),
      }
    : null;

  return (
    <>
      <div className="admin__entete">
        <h1 style={{ fontSize: 28 }}>{isNew ? "Nouvel article" : article!.title}</h1>
      </div>
      <ArticleForm article={formArticle} categories={categories} />
    </>
  );
}
