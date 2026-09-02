import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { frDate } from "@/lib/format";
import { setApplicationStatus, setAppointmentStatus, setSupportStatus } from "@/server/actions/admin";

export const metadata: Metadata = { title: "Demandes reçues — back-office", robots: { index: false } };

const SUBJECTS: Record<string, string> = {
  SUIVI_COMMANDE: "Suivi de commande", FACTURE_DEVIS: "Facture ou devis",
  PRODUIT_DEFECTUEUX: "Produit défectueux", FICHE_TECHNIQUE: "Fiche technique", AUTRE: "Autre",
};

/** Petit sélecteur de statut qui se soumet immédiatement (une action serveur par entité). */
function StatusSelect({ action, id, value, options }: { action: (fd: FormData) => Promise<void>; id: number; value: string; options: [string, string][] }) {
  return (
    <form action={action} style={{ display: "flex", gap: 6 }}>
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={"statut-" + id}>Statut</label>
      <select id={"statut-" + id} name="status" defaultValue={value} style={{ padding: 8, border: "1px solid var(--bordure)", fontSize: 14 }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <button type="submit" className="bouton-texte" style={{ fontSize: 13.5 }}>OK</button>
    </form>
  );
}

export default async function AdminRequests() {
  await requireAdmin();
  const [applications, appointments, support] = await Promise.all([
    db.resellerApplication.findMany({ include: { territory: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.appointment.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.supportRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <>
      <div className="admin__entete"><h1 style={{ fontSize: 28 }}>Demandes reçues</h1></div>

      <section className="panneau">
        <h2 style={{ fontSize: 20 }}>Candidatures revendeur ({applications.length})</h2>
        <div className="tableau-defilant" style={{ marginTop: 14 }}>
          <table className="tableau">
            <thead><tr>
              <th scope="col">Société</th><th scope="col">SIRET</th><th scope="col">Contact</th>
              <th scope="col">Zone</th><th scope="col">CA</th><th scope="col">Reçue le</th><th scope="col">Statut</th>
            </tr></thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <th scope="row">{a.companyName}</th>
                  <td style={{ fontSize: 13.5 }}>{a.siret}</td>
                  <td>{a.contactName}<br /><a href={"mailto:" + a.email} style={{ fontSize: 14 }}>{a.email}</a></td>
                  <td>{a.territory.regionName}</td>
                  <td style={{ fontSize: 14 }}>{a.annualRevenueBand ?? "—"}</td>
                  <td>{frDate(a.createdAt)}</td>
                  <td>
                    <StatusSelect action={setApplicationStatus} id={a.id} value={a.status}
                      options={[["NEW", "Nouvelle"], ["QUALIFYING", "En qualification"], ["ACCEPTED", "Acceptée"], ["REJECTED", "Refusée"]]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panneau" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 20 }}>Rendez-vous demandés ({appointments.length})</h2>
        <div className="tableau-defilant" style={{ marginTop: 14 }}>
          <table className="tableau">
            <thead><tr>
              <th scope="col">Créneau</th><th scope="col">Établissement</th><th scope="col">Contact</th>
              <th scope="col">Format</th><th scope="col">Dép.</th><th scope="col">Besoin</th><th scope="col">Statut</th>
            </tr></thead>
            <tbody>
              {appointments.map((r) => (
                <tr key={r.id}>
                  <th scope="row">{r.slotLabel}</th>
                  <td>{r.companyName}</td>
                  <td>{r.managerName}<br /><span style={{ fontSize: 14 }}>{r.phone} · {r.email}</span></td>
                  <td style={{ fontSize: 14 }}>{r.format}</td>
                  <td>{r.department}</td>
                  <td style={{ fontSize: 14, maxWidth: 260 }}>{r.needsText ?? "—"}</td>
                  <td>
                    <StatusSelect action={setAppointmentStatus} id={r.id} value={r.status}
                      options={[["REQUESTED", "Demandé"], ["CONFIRMED", "Confirmé"], ["DONE", "Réalisé"], ["CANCELLED", "Annulé"]]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panneau" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 20 }}>Demandes SAV ({support.length})</h2>
        <div className="tableau-defilant" style={{ marginTop: 14 }}>
          <table className="tableau">
            <thead><tr>
              <th scope="col">Objet</th><th scope="col">Commande</th><th scope="col">E-mail</th>
              <th scope="col">Message</th><th scope="col">Reçue le</th><th scope="col">Statut</th>
            </tr></thead>
            <tbody>
              {support.map((s) => (
                <tr key={s.id}>
                  <th scope="row">{SUBJECTS[s.subject] ?? s.subject}</th>
                  <td>{s.orderReference ?? "—"}</td>
                  <td><a href={"mailto:" + s.email} style={{ fontSize: 14 }}>{s.email}</a></td>
                  <td style={{ fontSize: 14, maxWidth: 320 }}>{s.message}</td>
                  <td>{frDate(s.createdAt)}</td>
                  <td>
                    <StatusSelect action={setSupportStatus} id={s.id} value={s.status}
                      options={[["NEW", "Nouvelle"], ["IN_PROGRESS", "En cours"], ["ANSWERED", "Répondu"], ["CLOSED", "Clôturée"]]} />
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
