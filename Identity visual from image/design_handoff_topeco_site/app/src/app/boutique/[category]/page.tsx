import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { catalogFilterSchema } from "@/lib/validation";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import ProductCard from "@/components/site/ProductCard";
import Filters from "./Filters";
import LongDescription from "./LongDescription";

const asArray = (v?: string | string[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

const CAPACITY: Record<string, Prisma.ProductWhereInput> = {
  "moins-500": { capacityMl: { lt: 500 } },
  "500-1000": { capacityMl: { gte: 500, lte: 1000 } },
  "plus-1000": { capacityMl: { gt: 1000 } },
};

type Params = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[]>> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const c = await db.category.findUnique({ where: { slug: category } });
  if (!c) return {};
  return { title: c.seoTitle ?? c.name, description: c.seoDescription ?? c.shortDescription };
}

export default async function CategoryPage({ params, searchParams }: Params) {
  const { category: slug } = await params;
  const filters = catalogFilterSchema.parse(await searchParams);

  const category = await db.category.findFirst({
    where: { slug, published: true },
    include: { regulatoryArticle: { select: { slug: true } } },
  });
  if (!category) notFound();

  const materials = asArray(filters.materiau).map((m) => m.toUpperCase().replace(/-/g, "_"));
  const capacities = asArray(filters.contenance).map((c) => CAPACITY[c]).filter(Boolean);

  const where: Prisma.ProductWhereInput = {
    categoryId: category.id,
    published: true,
    ...(materials.length ? { material: { in: materials as never[] } } : {}),
    ...(capacities.length ? { OR: capacities } : {}),
    ...(filters.prixMax ? { basePriceHt: { lte: Math.round(filters.prixMax * 100) } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.tri === "prix-croissant" ? { basePriceHt: "asc" }
    : filters.tri === "prix-decroissant" ? { basePriceHt: "desc" }
    : { sortOrder: "asc" };

  const [products, total, user] = await Promise.all([
    db.product.findMany({ where, orderBy, include: { images: true, priceTiers: true } }),
    db.product.count({ where: { categoryId: category.id, published: true } }),
    currentUser(),
  ]);

  const discountPct = Number(user?.account?.contractDiscountPct ?? 0);
  const availableMaterials = await db.product.groupBy({
    by: ["material"],
    where: { categoryId: category.id, published: true, material: { not: null } },
    _count: true,
  });

  return (
    <>
      <Breadcrumbs items={[{ href: "/boutique/emballages", label: "Boutique" }, { label: category.name }]} />

      <div className="conteneur" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <h1>{category.name}</h1>
        <div className="intro" style={{ marginTop: 14 }} dangerouslySetInnerHTML={{ __html: category.introHtml }} />
        {category.longDescriptionHtml && <LongDescription html={category.longDescriptionHtml} />}

        <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, alignItems: "start", marginTop: "clamp(24px,3vw,40px)" }}>
          <Filters
            materials={availableMaterials.map((m) => String(m.material))}
            selected={{ materiau: asArray(filters.materiau), contenance: asArray(filters.contenance), prixMax: filters.prixMax ?? 60 }}
          />

          <div style={{ minWidth: 0 }}>
            {category.regulatoryNoteHtml && (
              <aside className="encadre-vert">
                <h2 style={{ fontSize: 20 }}>Ce que dit la loi sur cette catégorie</h2>
                <div style={{ marginTop: 10, color: "var(--texte-2)" }} dangerouslySetInnerHTML={{ __html: category.regulatoryNoteHtml }} />
                {category.regulatoryArticle && (
                  <Link href={`/blog/${category.regulatoryArticle.slug}`} style={{ display: "inline-block", marginTop: 12 }}>Lire le détail</Link>
                )}
              </aside>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
              <p style={{ fontSize: 15, color: "var(--texte-3)" }}>
                {products.length} référence{products.length > 1 ? "s" : ""} sur {total}
              </p>
              <form method="get" className="champ" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <label htmlFor="tri" style={{ whiteSpace: "nowrap" }}>Trier par</label>
                <select id="tri" name="tri" defaultValue={filters.tri} style={{ minWidth: 190 }}>
                  <option value="pertinence">Pertinence</option>
                  <option value="prix-croissant">Prix croissant</option>
                  <option value="prix-decroissant">Prix décroissant</option>
                </select>
                <noscript><button type="submit" className="btn btn--bleu">Trier</button></noscript>
              </form>
            </div>

            {products.length === 0 ? (
              <p className="panneau" style={{ marginTop: 20 }}>
                Aucune référence ne correspond à ces filtres. <Link href={`/boutique/${category.slug}`}>Réinitialiser</Link>
              </p>
            ) : (
              <div className="grille grille--cartes" style={{ marginTop: 20 }}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} categorySlug={category.slug} discountPct={discountPct} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
