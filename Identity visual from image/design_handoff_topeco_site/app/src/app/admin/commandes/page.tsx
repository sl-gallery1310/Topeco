import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eurosHt, eurosTtc, frDate } from "@/lib/format";
import { setOrderStatus } from "@/server/actions/admin";

export const metadata: Metadata = { title: "Commandes et devis — back-office", robots: { index: false } };

const ORDER_STATUSES: [string, string][] = [
  ["EN_PREPARATION", "En préparation"], ["EXPEDIEE", "Expédiée"], ["LIVREE", "Livrée"],
  ["FACTURE_A_REGLER", "Facture à régler"], ["ANNULEE", "Annulée"],
];

export default async function AdminOrders() {
  await requireAdmin();
  const [orders, quotes] = await Promise.all([
    db.order.findMany({ include: { account: true, lines: true }, orderBy: { placedAt: "desc" }, take: 100 }),
    db.quote.findMany({ include: { account: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <>
      <div className="admin__entete"><h1 style={{ fontSize: 28 }}>Commandes et devis</h1></div>

      <section className="panneau">
        <h2 style={{ fontSize: 20 }}>Commandes ({orders.length})</h2>
        <div className="tableau-defilant" style={{ marginTop: 14 }}>
          <table className="tableau">
            <thead><tr>
              <th scope="col">Référence</th><th scope="col">Client</th><th scope="col">Date</th>
              <th scope="col">Lignes</th><th scope="col">Montant</th><th scope="col">Statut</th>
            </tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <th scope="row">{o.reference}</th>
                  <td>{o.account.companyName}<br /><span style={{ fontSize: 13.5, color: "var(--texte-3)" }}>n° {o.account.accountNumber}</span></td>
                  <td>{frDate(o.placedAt)}</td>
                  <td>{o.lines.length}</td>
                  <td>{eurosHt(o.totalHt)}<br /><span style={{ fontSize: 14, color: "var(--texte-3)" }}>{eurosTtc(o.totalTtc)}</span></td>
                  <td>
                    <form action={setOrderStatus} style={{ display: "flex", gap: 6 }}>
                      <input type="hidden" name="id" value={o.id} />
                      <label className="sr-only" htmlFor={"cmd-" + o.id}>Statut</label>
                      <select id={"cmd-" + o.id} name="status" defaultValue={o.status} style={{ padding: 8, border: "1px solid var(--bordure)", fontSize: 14 }}>
                        {ORDER_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button type="submit" className="bouton-texte" style={{ fontSize: 13.5 }}>OK</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panneau" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 20 }}>Devis ({quotes.length})</h2>
        <div className="tableau-defilant" style={{ marginTop: 14 }}>
          <table className="tableau">
            <thead><tr>
              <th scope="col">Référence</th><th scope="col">Client</th><th scope="col">Objet</th>
              <th scope="col">Validité</th><th scope="col">Montant</th><th scope="col">Statut</th>
            </tr></thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id}>
                  <th scope="row">{q.reference}</th>
                  <td>{q.account.companyName}</td>
                  <td>{q.label}</td>
                  <td>{frDate(q.validUntil)}</td>
                  <td>{eurosHt(q.totalHt)}<br /><span style={{ fontSize: 14, color: "var(--texte-3)" }}>{eurosTtc(q.totalTtc)}</span></td>
                  <td>
                    <span className={"pastille " + (q.status === "ACCEPTE" ? "pastille--livree" : q.status === "EN_COURS" ? "pastille--attente" : "pastille--neutre")}>
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
