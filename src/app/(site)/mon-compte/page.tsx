import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import { eurosHt, eurosTtc, frDate } from "@/lib/format";
import { resolvePrice } from "@/lib/pricing";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { logoutAction } from "@/server/actions/auth";
import { reorderLastOrder, acceptQuote } from "@/server/actions/account";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };

const PILL: Record<string, [string, string]> = {
  LIVREE: ["pastille--livree", "Livrée"],
  FACTURE_A_REGLER: ["pastille--attente", "Facture à régler"],
  EN_PREPARATION: ["pastille--neutre", "En préparation"],
  EXPEDIEE: ["pastille--neutre", "Expédiée"],
  ANNULEE: ["pastille--neutre", "Annulée"],
};

export default async function AccountPage() {
  const { account } = await requireClient();
  const discountPct = Number(account.contractDiscountPct);

  const [orders, quotes, ordersThisYear, invoicesDue, deadlines] = await Promise.all([
    db.order.findMany({ where: { accountId: account.id }, orderBy: { placedAt: "desc" }, take: 10, include: { lines: true } }),
    db.quote.findMany({ where: { accountId: account.id, status: "EN_COURS" }, orderBy: { validUntil: "asc" } }),
    db.order.count({ where: { accountId: account.id, placedAt: { gte: new Date(new Date().getFullYear() + "-01-01") } } }),
    db.order.count({ where: { accountId: account.id, status: "FACTURE_A_REGLER" } }),
    db.regulatoryDeadline.findMany({ where: { active: true }, orderBy: { effectiveOn: "asc" } }),
  ]);

  /* Alerte réglementaire : croisement de l’historique de commandes avec les échéances. */
  const orderedSkus = new Set(orders.flatMap((o) => o.lines.map((l) => l.sku)));
  const flaggedSkus = new Set<string>();
  for (const d of deadlines) {
    for (const sku of (Array.isArray(d.affectedSkus) ? (d.affectedSkus as string[]) : [])) {
      if (orderedSkus.has(sku)) flaggedSkus.add(sku);
    }
  }
  const flagged = await db.product.findMany({
    where: { OR: [{ sku: { in: [...flaggedSkus] } }, { agecStatus: "A_REMPLACER", sku: { in: [...orderedSkus] } }] },
    include: { category: true, replacement: { include: { category: true } } },
  });

  /* Tarifs professionnels : produits déjà commandés, au tarif du compte. */
  const contractProducts = await db.product.findMany({
    where: { sku: { in: [...orderedSkus] }, published: true },
    include: { priceTiers: true, category: true },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: "Mon compte" }]} />

      <div className="conteneur" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1>Bonjour, {account.companyName}</h1>
            <p style={{ marginTop: 10, color: "var(--texte-3)" }}>
              Compte professionnel n° {account.accountNumber} · remise contractuelle {discountPct}&nbsp;% ·
              encours {eurosHt(account.creditLimitHt)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <form action={reorderLastOrder}>
              <button type="submit" className="btn btn--vert">Repasser ma dernière commande</button>
            </form>
            <form action={logoutAction}>
              <button type="submit" className="btn btn--contour-bleu">Se déconnecter</button>
            </form>
          </div>
        </div>

        {/* KPI */}
        <div className="grille grille--kpi" style={{ marginTop: 30 }}>
          <div style={{ background: "var(--bleu)", padding: 22 }}>
            <p className="eyebrow" style={{ color: "var(--vert-clair)" }}>Commandes {new Date().getFullYear()}</p>
            <p style={{ marginTop: 10, font: "700 32px/1 var(--titre)", color: "var(--blanc)" }}>{ordersThisYear}</p>
          </div>
          <div className="panneau" style={{ padding: 22 }}>
            <p className="eyebrow">Devis en cours</p>
            <p style={{ marginTop: 10, font: "700 32px/1 var(--titre)", color: "var(--bleu)" }}>{quotes.length}</p>
          </div>
          <div className="panneau" style={{ padding: 22 }}>
            <p className="eyebrow">Factures à régler</p>
            <p style={{ marginTop: 10, font: "700 32px/1 var(--titre)", color: "var(--bleu)" }}>{invoicesDue}</p>
          </div>
          <div className="encadre-vert" style={{ padding: 22 }}>
            <p className="eyebrow">Alerte réglementaire</p>
            {flagged.length ? (
              <>
                <p style={{ marginTop: 10, fontSize: 15, color: "var(--texte-2)" }}>
                  {flagged.length} référence{flagged.length > 1 ? "s" : ""} de votre historique
                  {flagged.length > 1 ? " sont " : " est "}à remplacer avant la prochaine échéance.
                </p>
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 14.5 }}>
                  {flagged.map((p) => (
                    <li key={p.id}>
                      <Link href={`/boutique/${p.category.slug}/${p.slug}`}>{p.name}</Link>
                      {p.replacement && (
                        <> → <Link href={`/boutique/${p.replacement.category.slug}/${p.replacement.slug}`}>{p.replacement.name}</Link></>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p style={{ marginTop: 10, fontSize: 15, color: "var(--texte-2)" }}>
                Aucune référence de votre historique n’est concernée par les échéances en cours.
              </p>
            )}
          </div>
        </div>

        {/* Historique */}
        <section style={{ marginTop: 34 }}>
          <h2 style={{ fontSize: 22 }}>Historique de commandes</h2>
          <div className="tableau-defilant" style={{ marginTop: 14 }}>
            <table className="tableau">
              <thead>
                <tr>
                  <th scope="col">Commande</th><th scope="col">Date</th><th scope="col">Montant</th>
                  <th scope="col">Statut</th><th scope="col">Facture</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const [cls, label] = PILL[o.status] ?? ["pastille--neutre", o.status];
                  return (
                    <tr key={o.id}>
                      <th scope="row">{o.reference}</th>
                      <td>{frDate(o.placedAt)}</td>
                      <td>
                        {eurosHt(o.totalHt)}<br />
                        <span style={{ fontSize: 14, color: "var(--texte-3)" }}>{eurosTtc(o.totalTtc)}</span>
                      </td>
                      <td><span className={"pastille " + cls}>{label}</span></td>
                      <td>{o.invoiceUrl ? <a href={`/api/factures/${o.reference}`}>PDF</a> : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 26, marginTop: 34 }}>
          <section className="panneau" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 20 }}>Devis en cours</h2>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {quotes.length === 0 && <p style={{ fontSize: 15, color: "var(--texte-3)" }}>Aucun devis en cours.</p>}
              {quotes.map((q) => (
                <div key={q.id}>
                  <p style={{ font: "600 15.5px/1.4 var(--titre)", color: "var(--bleu)" }}>{q.reference} · {q.label}</p>
                  <p style={{ marginTop: 4, fontSize: 14.5, color: "var(--texte-3)" }}>
                    Valable jusqu’au {frDate(q.validUntil)} · {eurosHt(q.totalHt)} / {eurosTtc(q.totalTtc)}
                  </p>
                  <form action={acceptQuote} style={{ marginTop: 8 }}>
                    <input type="hidden" name="quoteId" value={q.id} />
                    <button type="submit" className="btn btn--contour-bleu" style={{ minHeight: 44, padding: "10px 16px", fontSize: 14 }}>
                      Accepter le devis
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section className="panneau" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 20 }}>Vos tarifs professionnels</h2>
            <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--texte-3)" }}>
              Remise contractuelle de {discountPct}&nbsp;% appliquée automatiquement au panier.
            </p>
            <table className="tableau" style={{ marginTop: 16 }}>
              <thead><tr><th scope="col">Référence</th><th scope="col">Votre prix</th></tr></thead>
              <tbody>
                {contractProducts.map((p) => {
                  const price = resolvePrice({ basePriceHt: p.basePriceHt, tiers: p.priceTiers, vatRate: Number(p.vatRate), discountPct });
                  return (
                    <tr key={p.id}>
                      <th scope="row" style={{ fontWeight: 400 }}>
                        <Link href={`/boutique/${p.category.slug}/${p.slug}`}>{p.name}</Link>
                      </th>
                      <td>
                        {eurosHt(price.unitPriceHt)}<br />
                        <span style={{ fontSize: 14, color: "var(--texte-3)" }}>{eurosTtc(price.unitPriceTtc)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </>
  );
}
