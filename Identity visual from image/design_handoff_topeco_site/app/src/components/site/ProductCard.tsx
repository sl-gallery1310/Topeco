import Link from "next/link";
import Image from "next/image";
import Price from "./Price";
import ImagePlaceholder from "./ImagePlaceholder";
import AddToCart from "./AddToCart";
import { resolvePrice } from "@/lib/pricing";

type Props = {
  product: {
    id: number;
    slug: string;
    name: string;
    lotLabel: string | null;
    basePriceHt: number;
    vatRate: unknown;
    images: { url: string; alt: string }[];
    priceTiers: { minQty: number; maxQty: number | null; unitPriceHt: number }[];
  };
  categorySlug: string;
  /** remise contractuelle du compte connecté, résolue côté serveur */
  discountPct?: number;
};

export default function ProductCard({ product, categorySlug, discountPct = 0 }: Props) {
  const price = resolvePrice({
    basePriceHt: product.basePriceHt,
    tiers: product.priceTiers,
    vatRate: Number(product.vatRate ?? 0.2),
    discountPct,
  });
  const img = product.images[0];
  const href = `/boutique/${categorySlug}/${product.slug}`;

  return (
    <article className="carte carte--lien">
      <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
        {img ? (
          <Image src={img.url} alt={img.alt} width={460} height={150} style={{ width: "100%", height: 150, objectFit: "cover" }} />
        ) : (
          <ImagePlaceholder height={150} />
        )}
      </Link>
      <div className="carte__corps">
        <h3 style={{ fontSize: 16.5 }}>
          <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>{product.name}</Link>
        </h3>
        {product.lotLabel && <p style={{ fontSize: 14, color: "var(--texte-3)" }}>{product.lotLabel}</p>}
        <div className="carte__bas" style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12 }}>
          <Price ht={price.unitPriceHt} ttc={price.unitPriceTtc} />
          <AddToCart productId={product.id} label="Ajouter au panier" />
        </div>
      </div>
    </article>
  );
}
