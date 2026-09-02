import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveSettings } from "@/server/actions/admin";

export const metadata: Metadata = { title: "Réglages — back-office", robots: { index: false } };

const GROUPS: Record<string, string> = {
  contact: "Coordonnées affichées sur le site",
  legal: "Mentions légales et TVA",
  demo: "Mode projet étudiant",
  seo: "Référencement",
};

export default async function AdminSettings() {
  await requireAdmin(["ADMIN"]);
  const settings = await db.setting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
  const groups = [...new Set(settings.map((s) => s.group))];

  return (
    <>
      <div className="admin__entete"><h1 style={{ fontSize: 28 }}>Réglages</h1></div>

      <form action={saveSettings}>
        {groups.map((g) => (
          <section key={g} className="panneau" style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 20 }}>{GROUPS[g] ?? g}</h2>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {settings.filter((s) => s.group === g).map((s) => (
                <div key={s.key} className="champ">
                  <label htmlFor={s.key}>{s.label}</label>
                  {s.value.length > 90 ? (
                    <textarea id={s.key} name={"setting." + s.key} rows={3} defaultValue={s.value} />
                  ) : (
                    <input id={s.key} name={"setting." + s.key} defaultValue={s.value} />
                  )}
                  <p style={{ fontSize: 13, color: "var(--texte-4)" }}>clé : {s.key}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <button type="submit" className="btn btn--vert">Enregistrer les réglages</button>
      </form>

      <p style={{ marginTop: 20, fontSize: 14, color: "var(--texte-3)", maxWidth: "70ch" }}>
        La mention « projet étudiant fictif » est également contrôlée par la variable
        d’environnement NEXT_PUBLIC_DEMO_MODE : à false, le panier et les confirmations
        cessent d’afficher les avertissements de démonstration.
      </p>
    </>
  );
}
