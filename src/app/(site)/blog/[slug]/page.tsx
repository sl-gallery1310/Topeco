import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { frDate, readingMinutes } from "@/lib/format";
import { blocksToText, parseBlocks } from "@/lib/blocks";
import Blocks from "@/components/site/Blocks";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import ImagePlaceholder from "@/components/site/ImagePlaceholder";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rows = await db.article.findMany({ where: { published: true }, select: { slug: true } });
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = await db.article.findUnique({ where: { slug }, select: { title: true, dek: true, seoTitle: true, seoDescription: true } });
  return a ? { title: a.seoTitle ?? a.title, description: a.seoDescription ?? a.dek } : {};
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await db.article.findFirst({
    where: { slug, published: true },
    include: { category: true },
  });
  if (!article) notFound();

  const blocks = parseBlocks(article.bodyBlocks);
  const minutes = readingMinutes(blocksToText(blocks));

  return (
    <>
      <Breadcrumbs items={[{ href: "/blog", label: "Blog" }, { label: article.title }]} />

      <article className="colonne-texte" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <p className="eyebrow">{article.category.name}</p>
        <h1 style={{ marginTop: 12, fontSize: "clamp(28px,3.6vw,42px)", lineHeight: 1.14 }}>{article.title}</h1>
        <p style={{ marginTop: 14, fontSize: 14.5, color: "var(--texte-3)" }}>
          {article.publishedAt && "Publié le " + frDate(article.publishedAt)}
          {" · mis à jour le " + frDate(article.updatedAt)}
          {" · " + minutes + " min de lecture"}
        </p>

        <div style={{ marginTop: 24 }}>
          {article.heroImageUrl ? (
            <Image src={article.heroImageUrl} alt={article.heroImageAlt ?? ""} width={820} height={420} style={{ width: "100%", height: "auto" }} priority />
          ) : (
            <ImagePlaceholder height={240} label="Illustration à venir" markSize={48} />
          )}
        </div>

        <div style={{ marginTop: 28 }}>
          <Blocks blocks={blocks} />
        </div>

        {article.disclaimerText && (
          <p style={{ marginTop: 28, fontSize: 14.5, color: "var(--texte-3)" }}>{article.disclaimerText}</p>
        )}

        <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid var(--bordure)", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between" }}>
          <Link href="/blog">← Tous les articles</Link>
          <Link href="/boutique/emballages">Voir les produits conformes →</Link>
        </div>
      </article>
    </>
  );
}
