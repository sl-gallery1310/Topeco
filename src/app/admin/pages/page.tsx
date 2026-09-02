import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseBlocks } from "@/lib/blocks";
import { togglePagePublished } from "@/server/actions/admin";

export const metadata: Metadata = { title: "Pages — back-office", robots: { index: false } };

/**
 * Adresses attendues par la navigation (Header) et le pied de page (Footer).
 * Sans enregistrement `Page` publié, le lien renvoie une 404 : la liste le signale
 * pour que les pages manquantes soient visibles au lieu d'être découvertes en ligne.
 */
const ATTENDUES: [string, string][] = [
  ["nos-engagements", "Nos engagements (navigation principale)"],
  ["mentions-legales", "Mentions légales"],
  ["cgv", "CGV"],
  ["cgu", "CGU"],
  ["confidentialite", "Politique de confidentialité"],
  ["plan-du-site", "Plan du site"],
  ["accessibilite", "Accessibilité"],
];

export default async function AdminPages() {
  await requireAdmin();

  const pages = await db.page.findMany({ orderBy: { slug: "asc" } });
  const parSlug = new Map(pages.map((p) => [p.slug, p]));
  const manquantes = ATTENDUES.filter(([slug]) => !parSlug.has(slug));
  const nonPubliees = ATTENDUES.filter(([slug]) => parSlug.get(slug)?.published === false);

  return (
    <>
      <div className="admin__entete">
        <h1 style={{ fontSize: 28 }}>
          Pages <span style={{ color: "var(--texte-3)", fontSize: 18 }}>({pages.length})</span>
        </h1>
        <Link href="/admin/pages/nouveau" className="btn btn--vert">Nouvelle page</Link>
      </div>

      {(manquantes.length > 0 || nonPubliees.length > 0) && (
        <aside className="encadre-vert" style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 18 }}>Liens de navigation sans page publiée</h2>
          <p style={{ marginTop: 8, color: "var(--texte-2)" }}>
            Ces adresses sont référencées par le site et renvoient une 404 tant qu’une
            page publiée ne leur correspond pas.
          </p>
          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
            {manquantes.map(([slug, label]) => (
              <li key={slug} style={{ marginBottom: 6 }}>
                <code>/{slug}</code> — {label} ·{" "}
                <Link href={`/admin/pages/nouveau?slug=${slug}`}>créer</Link>
              </li>
            ))}
            {nonPubliees.map(([slug, label]) => (
              <li key={slug} style={{ marginBottom: 6 }}>
                <code>/{slug}</code> — {label} · brouillon ·{" "}
                <Link href={`/admin/pages/${parSlug.get(slug)!.id}`}>compléter</Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="tableau-defilant">
        <table className="tableau">
          <thead>
            <tr>
              <th scope="col">Adresse</th>
              <th scope="col">Titre</th>
              <th scope="col">Blocs</th>
              <th scope="col">Modifiée le</th>
              <th scope="col">État</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--texte-3)" }}>Aucune page pour l’instant.</td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id}>
                  <th scope="row" style={{ fontFamily: "var(--titre)", fontSize: 13.5 }}>/{p.slug}</th>
                  <td><Link href={"/admin/pages/" + p.id}>{p.title}</Link></td>
                  <td>{parseBlocks(p.bodyBlocks).length || "—"}</td>
                  <td>{p.updatedAt.toLocaleDateString("fr-FR")}</td>
                  <td>
                    <span className={"pastille " + (p.published ? "pastille--livree" : "pastille--neutre")}>
                      {p.published ? "Publiée" : "Brouillon"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <form action={togglePagePublished}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="bouton-texte" style={{ fontSize: 13.5 }}>
                        {p.published ? "Dépublier" : "Publier"}
                      </button>
                    </form>
                    {p.published && (
                      <Link href={"/" + p.slug} target="_blank" style={{ fontSize: 13.5 }}>Voir ↗</Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
