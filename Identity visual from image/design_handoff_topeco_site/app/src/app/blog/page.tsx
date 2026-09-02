import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { frDate, readingMinutes } from "@/lib/format";
import { blocksToText, parseBlocks } from "@/lib/blocks";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import ImagePlaceholder from "@/components/site/ImagePlaceholder";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — réglementation et conseils",
  description: "Loi AGEC, matériaux et retours d’expérience : ce qu’il faut savoir pour mettre sa carte en conformité.",
};

type Props = { searchParams: Promise<{ categorie?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { categorie } = await searchParams;

  const [categories, featured, articles] = await Promise.all([
    db.articleCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    db.article.findFirst({ where: { published: true, featured: true }, include: { category: true }, orderBy: { publishedAt: "desc" } }),
    db.article.findMany({
      where: { published: true, featured: false, ...(categorie ? { category: { slug: categorie } } : {}) },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const minutes = (a: { bodyBlocks: unknown }) => readingMinutes(blocksToText(parseBlocks(a.bodyBlocks)));

  return (
    <>
      <Breadcrumbs items={[{ label: "Blog" }]} />

      <div className="conteneur" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <h1>Réglementation et conseils</h1>
        <p className="intro" style={{ marginTop: 14 }}>
          Les échéances réglementaires, les matériaux et les retours d’établissements qui ont déjà
          fait le changement.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
          <Link href="/blog" className="btn" style={{ minHeight: 44, padding: "11px 18px", fontSize: 14, background: !categorie ? "var(--bleu)" : "var(--blanc)", color: !categorie ? "var(--blanc)" : "var(--bleu)", border: "1px solid var(--bordure)" }}>
            Tous les articles
          </Link>
          {categories.map((c) => {
            const active = categorie === c.slug;
            return (
              <Link key={c.id} href={"/blog?categorie=" + c.slug} className="btn"
                style={{ minHeight: 44, padding: "11px 18px", fontSize: 14, background: active ? "var(--bleu)" : "var(--blanc)", color: active ? "var(--blanc)" : "var(--bleu)", border: "1px solid var(--bordure)" }}>
                {c.name}
              </Link>
            );
          })}
        </div>

        {featured && !categorie && (
          <Link href={"/blog/" + featured.slug} className="carte" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {featured.heroImageUrl ? (
              <Image src={featured.heroImageUrl} alt={featured.heroImageAlt ?? ""} width={640} height={220} style={{ width: "100%", height: "100%", minHeight: 220, objectFit: "cover" }} />
            ) : (
              <ImagePlaceholder height="100%" label="Illustration à venir" />
            )}
            <div style={{ padding: "clamp(20px,3vw,32px)" }}>
              <p className="eyebrow">{featured.eyebrow ?? "À la une · " + featured.category.name}</p>
              <h2 style={{ marginTop: 12, fontSize: "clamp(21px,2.2vw,28px)" }}>{featured.title}</h2>
              <p style={{ marginTop: 12, color: "var(--texte-2)" }}>{featured.dek}</p>
              <p style={{ marginTop: 14, fontSize: 14, color: "var(--texte-3)" }}>
                {featured.publishedAt && frDate(featured.publishedAt)} · {minutes(featured)} min de lecture
              </p>
            </div>
          </Link>
        )}

        <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22, marginTop: 28 }}>
          {articles.map((a) => (
            <article key={a.id} className="carte carte--lien">
              <Link href={"/blog/" + a.slug} style={{ textDecoration: "none", color: "inherit" }}>
                {a.heroImageUrl ? (
                  <Image src={a.heroImageUrl} alt={a.heroImageAlt ?? ""} width={460} height={160} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                ) : (
                  <ImagePlaceholder height={160} label="Illustration à venir" />
                )}
              </Link>
              <div className="carte__corps">
                <p className="eyebrow" style={{ fontSize: 11.5 }}>{a.category.name}</p>
                <h2 style={{ fontSize: 19, fontWeight: 600 }}>
                  <Link href={"/blog/" + a.slug} style={{ textDecoration: "none", color: "inherit" }}>{a.title}</Link>
                </h2>
                <p style={{ fontSize: 14.5, color: "var(--texte-3)" }}>{a.dek}</p>
                <div className="carte__bas" style={{ paddingTop: 12 }}>
                  <p style={{ fontSize: 13.5, color: "var(--texte-3)" }}>
                    {a.publishedAt && frDate(a.publishedAt)} · {minutes(a)} min de lecture
                  </p>
                  <Link href={"/blog/" + a.slug} style={{ display: "inline-block", marginTop: 10, font: "600 14.5px/1 var(--titre)" }}>
                    Lire l’article →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
