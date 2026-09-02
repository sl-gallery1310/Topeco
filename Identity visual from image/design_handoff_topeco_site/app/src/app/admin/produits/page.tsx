import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eurosHt } from "@/lib/format";
import { deleteProduct } from "@/server/actions/admin";

export const metadata: Metadata = { title: "Produits — back-office", robots: { index: false } };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ statut?: string; q?: string }> }) {
  await requireAdmin();
  const { statut, q } = await searchParams;

  const products = await db.product.findMany({
    where: {
      ...(statut === "brouillon" ? { published: false } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {}),
    },
    include: { category: true, priceTiers: true },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <>
      <div className="admin__entete">
        <h1 style={{ fontSize: 28 }}>Produits <span style={{ color: "var(--texte-3)", fontSize: 18 }}>({products.length})</span></h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <form method="get" style={{ display: "flex", gap: 8 }}>
            <label className="sr-only" htmlFor="q">Rechercher</label>
            <input id="q" name="q" defaultValue={q} placeholder="Nom ou SKU" style={{ padding: 11, border: "1px solid var(--bordure)", minHeight: 44 }} />
            <button type="submit" className="btn btn--contour-bleu" style={{ minHeight: 44, padding: "11px 16px" }}>Chercher</button>
          </form>
          <Link href="/admin/produits/nouveau" className="btn btn--vert">Nouveau produit</Link>
        </div>
      </div>

      <div className="tableau-defilant">
        <table className="tableau">
          <thead>
            <tr>
              <th scope="col">SKU</th><th scope="col">Nom</th><th scope="col">Catégorie</th>
              <th scope="col">Prix HT</th><th scope="col">Paliers</th><th scope="col">AGEC</th>
              <th scope="col">État</th><th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <th scope="row" style={{ fontFamily: "var(--titre)", fontSize: 13.5 }}>{p.sku}</th>
                <td><Link href={"/admin/produits/" + p.id}>{p.name}</Link></td>
                <td>{p.category.name}</td>
                <td>{eurosHt(p.basePriceHt)}</td>
                <td>{p.priceTiers.length || "—"}</td>
                <td>{p.agecStatus === "CONFORME" ? "Conforme" : p.agecStatus === "A_SURVEILLER" ? "À surveiller" : "À remplacer"}</td>
                <td>
                  <span className={"pastille " + (p.published ? "pastille--livree" : "pastille--neutre")}>
                    {p.published ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="bouton-texte" style={{ fontSize: 13.5, borderColor: "var(--brun)", color: "var(--brun)" }}>
                      Dépublier
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 16, fontSize: 14, color: "var(--texte-3)" }}>
        Un produit n’est jamais supprimé : il est dépublié et marqué « arrêté », car des commandes y font référence.
      </p>
    </>
  );
}
