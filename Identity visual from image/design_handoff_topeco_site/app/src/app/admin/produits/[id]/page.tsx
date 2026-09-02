import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import ProductForm from "./ProductForm";

export const metadata: Metadata = { title: "Fiche produit — back-office", robots: { index: false } };

export default async function AdminProductEdit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "nouveau";

  const [product, categories, others] = await Promise.all([
    isNew ? null : db.product.findUnique({ where: { id: Number(id) }, include: { priceTiers: { orderBy: { minQty: "asc" } }, images: true } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.product.findMany({ where: { published: true }, select: { id: true, name: true, sku: true }, orderBy: { name: "asc" } }),
  ]);

  if (!isNew && !product) notFound();

  return (
    <>
      <div className="admin__entete">
        <h1 style={{ fontSize: 28 }}>{isNew ? "Nouveau produit" : product!.name}</h1>
      </div>
      <ProductForm
        product={
          product
            ? {
                ...product,
                basePriceHt: product.basePriceHt / 100,
                vatRate: Number(product.vatRate),
                bullets: Array.isArray(product.bullets) ? (product.bullets as string[]) : [],
                agecDeadline: product.agecDeadline ? product.agecDeadline.toISOString().slice(0, 10) : "",
                priceTiers: product.priceTiers.map((t) => ({ minQty: t.minQty, maxQty: t.maxQty, unitPriceHt: t.unitPriceHt / 100 })),
              }
            : null
        }
        categories={categories}
        others={others.filter((o) => o.id !== product?.id)}
      />
    </>
  );
}
