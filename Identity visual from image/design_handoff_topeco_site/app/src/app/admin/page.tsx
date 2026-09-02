import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eurosHt, frDate } from "@/lib/format";

export const metadata: Metadata = { title: "Back-office", robots: { index: false } };

export default async function AdminDashboard() {
  await requireAdmin();

  const [products, unpublished, applications, appointments, support, orders, revenue, searchesNoResult] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { published: false } }),
    db.resellerApplication.count({ where: { status: "NEW" } }),
    db.appointment.count({ where: { status: "REQUESTED" } }),
    db.supportRequest.count({ where: { status: "NEW" } }),
    db.order.findMany({ orderBy: { placedAt: "desc" }, take: 5, include: { account: true } }),
    db.order.aggregate({ _sum: { totalHt: true }, where: { status: { not: "ANNULEE" } } }),
    db.dealerSearch.findMany({ where: { results: 0 }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const tiles: [string, string | number, string][] = [
    ["Références", products, "/admin/produits"],
    ["Brouillons", unpublished, "/admin/produits?statut=brouillon"],
    ["Candidatures à traiter", applications, "/admin/demandes"],
    ["RDV à confirmer", appointments, "/admin/demandes"],
    ["Demandes SAV", support, "/admin/demandes"],
    ["Chiffre d’affaires HT", eurosHt(revenue._sum.totalHt ?? 0), "/admin/commandes"],
  ];

  return (
    <>
      <div className="admin__entete">
        <h1 style={{ fontSize: 28 }}>Tableau de bord</h1>
        <Link href="/admin/produits/nouveau" className="btn btn--vert">Nouveau produit</Link>
      </div>

      <div className="grille grille--kpi">
        {tiles.map(([label, value, href]) => (
          <Link key={label} href={href} className="panneau" style={{ padding: 20, textDecoration: "none" }}>
            <p className="eyebrow">{label}</p>
            <p style={{ marginTop: 10, font: "700 30px/1 var(--titre)", color: "var(--bleu)" }}>{value}</p>
          </Link>
        ))}
      </div>

      <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22, marginTop: 26 }}>
        <section className="panneau">
          <h2 style={{ fontSize: 20 }}>Dernières commandes</h2>
          <table className="tableau" style={{ marginTop: 14 }}>
            <thead><tr><th scope="col">Référence</th><th scope="col">Client</th><th scope="col">Montant HT</th><th scope="col">Date</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <th scope="row"><Link href="/admin/commandes">{o.reference}</Link></th>
                  <td>{o.account.companyName}</td>
                  <td>{eurosHt(o.totalHt)}</td>
                  <td>{frDate(o.placedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panneau">
          <h2 style={{ fontSize: 20 }}>Recherches revendeur sans résultat</h2>
          <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--texte-3)" }}>
            Zones demandées par les visiteurs et non couvertes par le réseau.
          </p>
          <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 15 }}>
            {searchesNoResult.length === 0 && <li style={{ color: "var(--texte-3)" }}>Aucune pour le moment.</li>}
            {searchesNoResult.map((s) => <li key={s.id}>{s.query} — {frDate(s.createdAt)}</li>)}
          </ul>
        </section>
      </div>
    </>
  );
}
