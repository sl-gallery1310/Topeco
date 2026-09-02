import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseBlocks } from "@/lib/blocks";
import PageForm from "./PageForm";

export const metadata: Metadata = { title: "Page — back-office", robots: { index: false } };

export default async function AdminPageEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slug?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { slug: slugPrefill } = await searchParams;
  const isNew = id === "nouveau";

  const page = isNew ? null : await db.page.findUnique({ where: { id: Number(id) } });
  if (!isNew && !page) notFound();

  // Objet intermédiaire : les colonnes nullables deviennent des chaînes pour que
  // les champs restent contrôlés, et bodyBlocks est typé avant d’atteindre le formulaire.
  const formPage = page
    ? {
        id: page.id,
        slug: page.slug,
        title: page.title,
        introHtml: page.introHtml ?? "",
        seoTitle: page.seoTitle ?? "",
        seoDescription: page.seoDescription ?? "",
        published: page.published,
        bodyBlocks: parseBlocks(page.bodyBlocks),
      }
    : null;

  return (
    <>
      <div className="admin__entete">
        <h1 style={{ fontSize: 28 }}>{isNew ? "Nouvelle page" : page!.title}</h1>
      </div>
      <PageForm page={formPage} slugPrefill={slugPrefill} />
    </>
  );
}
