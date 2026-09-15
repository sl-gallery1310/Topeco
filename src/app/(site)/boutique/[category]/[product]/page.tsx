import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fileSize } from "@/lib/format";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Gallery from "./Gallery";
import BuyBox from "./BuyBox";
import DealerSearchForm from "@/components/site/DealerSearchForm";

type Params = { params: Promise<{ category: string; product: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { product } = await params;
  const p = await db.product.findUnique({ where: { slug: product }, select: { name: true, lotLabel: true } });
  return p ? { title: p.name, description: p.lotLabel ?? undefined } : {};
}

export default async function ProductPage({ params }: Params) {
  const { category: categorySlug, product: productSlug } = await params;

  const product = await db.product.findFirst({
    where: { slug: productSlug, published: true, category: { slug: categorySlug } },
    include: { images: { orderBy: { sortOrder: "asc" } }, priceTiers: { orderBy: { minQty: "asc" } }, category: true },
  });
  if (!product) notFound();

  const user = await currentUser();
  const discountPct = Number(user?.account?.contractDiscountPct ?? 0);

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/boutique/emballages", label: "Boutique" },
          { href: `/boutique/${product.category.slug}`, label: product.category.name },
          { label: product.name },
        ]}
      />

      <div className="conteneur" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "clamp(24px,3vw,44px)" }}>
          <Gallery images={product.images} productName={product.name} />

          <div>
            <h1 style={{ fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.15 }}>{product.name}</h1>
            <p style={{ marginTop: 12, color: "var(--texte-3)" }}>
              Référence {product.sku}{product.specLine ? " · " + product.specLine : ""}
            </p>

            <BuyBox
              productId={product.id}
              basePriceHt={product.basePriceHt}
              vatRate={Number(product.vatRate)}
              discountPct={discountPct}
              tiers={product.priceTiers.map((t) => ({ minQty: t.minQty, maxQty: t.maxQty, unitPriceHt: t.unitPriceHt }))}
              sampleAvailable={product.sampleAvailable}
            />

            {product.recyclabilityUrl && (
              <p style={{ marginTop: 16 }}>
                <a href={product.recyclabilityUrl}>
                  Fiche de recyclabilité (PDF, {product.recyclabilitySize ? fileSize(product.recyclabilitySize) : "—"})
                </a>
              </p>
            )}

            {product.lifetimeWarranty && (
              <aside className="encadre-vert" style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 20 }}>Garantie à vie</h2>
                <p style={{ marginTop: 8 }}>Remplacement en cas de déformation ou de corrosion, sans justificatif d’achat.</p>
              </aside>
            )}
          </div>
        </div>

        <section className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(24px,3vw,44px)", marginTop: "clamp(32px,4vw,52px)" }}>
          <div>
            <h2 style={{ fontSize: 22 }}>Description technique</h2>
            {product.descriptionHtml && (
              <div style={{ marginTop: 12, color: "var(--texte-2)" }} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            )}
            {Array.isArray(product.bullets) && (
              <ul style={{ marginTop: 16, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8, color: "var(--texte-2)" }}>
                {(product.bullets as string[]).map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
          </div>

          <div className="section--bleu sur-bleu" style={{ padding: "clamp(20px,3vw,32px)" }}>
            <h2 style={{ fontSize: 21 }}>Trouver ce produit chez un revendeur près de vous</h2>
            <DealerSearchForm productId={product.id} onDark />
            <Link href="/nos-revendeurs" className="lien-vert-clair" style={{ display: "inline-block", marginTop: 18 }}>
              Voir tous les revendeurs →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
