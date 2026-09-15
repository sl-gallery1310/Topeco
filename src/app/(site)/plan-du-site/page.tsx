import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import Breadcrumbs from "@/components/site/Breadcrumbs";

export const metadata: Metadata = {
  title: "Plan du site",
  description: "Toutes les pages du site TOPECO : boutique, revendeurs, blog et informations.",
};

/**
 * Plan du site généré depuis la base : un produit, un article ou une page publiés
 * y apparaissent sans intervention. Route dédiée, prioritaire sur /[slug].
 */
export const dynamic = "force-dynamic";

export default async function PlanDuSite() {
  const [categories, articles, pages] = await Promise.all([
    db.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        products: { where: { published: true }, orderBy: { name: "asc" }, select: { slug: true, name: true } },
      },
    }),
    db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    db.page.findMany({
      where: { published: true },
      orderBy: { title: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const sections: { titre: string; liens: [string, string][] }[] = [
    {
      titre: "Le site",
      liens: [
        ["/", "Accueil"],
        ["/nos-revendeurs", "Nos revendeurs"],
        ["/blog", "Blog"],
        ["/contact", "Contact et rendez-vous"],
        ["/connexion", "Espace client"],
      ],
    },
    {
      titre: "Informations",
      liens: [...pages.map((p): [string, string] => ["/" + p.slug, p.title]), ["/plan-du-site", "Plan du site"]],
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan du site" }]} />
      <div className="colonne-texte" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <h1>Plan du site</h1>

        {sections.map((s) => (
          <section key={s.titre} style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22 }}>{s.titre}</h2>
            <ul style={{ marginTop: 12, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
              {s.liens.map(([href, label]) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </section>
        ))}

        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22 }}>Boutique</h2>
          {categories.map((c) => (
            <div key={c.slug} style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 17 }}>
                <Link href={"/boutique/" + c.slug}>{c.name}</Link>
              </h3>
              {c.products.length > 0 && (
                <ul style={{ marginTop: 8, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 4, fontSize: 15 }}>
                  {c.products.map((p) => (
                    <li key={p.slug}><Link href={`/boutique/${c.slug}/${p.slug}`}>{p.name}</Link></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        {articles.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22 }}>Articles du blog</h2>
            <ul style={{ marginTop: 12, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
              {articles.map((a) => (
                <li key={a.slug}><Link href={"/blog/" + a.slug}>{a.title}</Link></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
