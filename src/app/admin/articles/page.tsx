import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseBlocks } from "@/lib/blocks";
import { toggleArticlePublished } from "@/server/actions/admin";

export const metadata: Metadata = { title: "Articles — back-office", robots: { index: false } };

export default async function AdminArticles() {
  await requireAdmin();

  const articles = await db.article.findMany({
    include: { category: true },
    orderBy: [{ published: "asc" }, { publishedAt: "desc" }, { id: "desc" }],
  });

  const vides = articles.filter((a) => parseBlocks(a.bodyBlocks).length <= 1);

  return (
    <>
      <div className="admin__entete">
        <h1 style={{ fontSize: 28 }}>
          Articles <span style={{ color: "var(--texte-3)", fontSize: 18 }}>({articles.length})</span>
        </h1>
        <Link href="/admin/articles/nouveau" className="btn btn--vert">Nouvel article</Link>
      </div>

      {vides.length > 0 && (
        <aside className="encadre-vert" style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 18 }}>Articles à étoffer</h2>
          <p style={{ marginTop: 8, color: "var(--texte-2)" }}>
            Ces articles n’ont qu’un bloc ou aucun : la page s’affiche, mais presque vide.
          </p>
          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
            {vides.map((a) => (
              <li key={a.id} style={{ marginBottom: 6 }}>
                <Link href={"/admin/articles/" + a.id}>{a.title}</Link> — {parseBlocks(a.bodyBlocks).length} bloc
                {parseBlocks(a.bodyBlocks).length > 1 ? "s" : ""}
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="tableau-defilant">
        <table className="tableau">
          <thead>
            <tr>
              <th scope="col">Titre</th>
              <th scope="col">Rubrique</th>
              <th scope="col">Blocs</th>
              <th scope="col">Publié le</th>
              <th scope="col">État</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--texte-3)" }}>Aucun article pour l’instant.</td>
              </tr>
            ) : (
              articles.map((a) => (
                <tr key={a.id}>
                  <th scope="row" style={{ fontWeight: 400 }}>
                    <Link href={"/admin/articles/" + a.id}>{a.title}</Link>
                    {a.featured && (
                      <span className="pastille pastille--neutre" style={{ marginLeft: 8 }}>À la une</span>
                    )}
                    <span style={{ display: "block", fontSize: 13, color: "var(--texte-3)" }}>/{a.slug}</span>
                  </th>
                  <td>{a.category.name}</td>
                  <td>{parseBlocks(a.bodyBlocks).length || "—"}</td>
                  <td>{a.publishedAt ? a.publishedAt.toLocaleDateString("fr-FR") : "—"}</td>
                  <td>
                    <span className={"pastille " + (a.published ? "pastille--livree" : "pastille--neutre")}>
                      {a.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <form action={toggleArticlePublished}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="bouton-texte" style={{ fontSize: 13.5 }}>
                        {a.published ? "Dépublier" : "Publier"}
                      </button>
                    </form>
                    {a.published && (
                      <Link href={"/blog/" + a.slug} target="_blank" style={{ fontSize: 13.5 }}>Voir ↗</Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 16, fontSize: 14, color: "var(--texte-3)" }}>
        Un article dépublié disparaît du blog et du sitemap, mais reste modifiable ici.
      </p>
    </>
  );
}
