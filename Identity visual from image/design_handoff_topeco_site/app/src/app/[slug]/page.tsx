import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { parseBlocks } from "@/lib/blocks";
import Blocks from "@/components/site/Blocks";
import Breadcrumbs from "@/components/site/Breadcrumbs";

/**
 * Pages de contenu libre gérées au back-office :
 * /mentions-legales, /cgv, /cgu, /confidentialite, /accessibilite, /plan-du-site, /nos-engagements.
 * H1 en brun (charte : pages légales sobres, sans carte ni imagerie).
 */
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.page.findUnique({ where: { slug } });
  return p ? { title: p.seoTitle ?? p.title, description: p.seoDescription ?? undefined } : {};
}

export default async function ContentPage({ params }: Params) {
  const { slug } = await params;
  const page = await db.page.findFirst({ where: { slug, published: true } });
  if (!page) notFound();

  const legal = ["mentions-legales", "cgv", "cgu", "confidentialite", "accessibilite"].includes(slug);

  return (
    <>
      <Breadcrumbs items={[{ label: page.title }]} />
      <div className="colonne-texte" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <h1 style={legal ? { color: "var(--brun)" } : undefined}>{page.title}</h1>
        {page.introHtml && <div className="intro" style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: page.introHtml }} />}
        <div style={{ marginTop: 24 }}>
          <Blocks blocks={parseBlocks(page.bodyBlocks)} />
        </div>
      </div>
    </>
  );
}
