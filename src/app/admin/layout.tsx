import Link from "next/link";
import { logoutAction } from "@/server/actions/auth";
import { currentUser } from "@/lib/auth";

/**
 * Coquille du back-office. L’authentification est vérifiée par chaque page
 * (requireAdmin) afin que /admin/connexion reste accessible dans la même arborescence.
 * /admin est hors du groupe (site) : ni en-tête, ni pied de page, ni bandeau cookies
 * du site public ici.
 */
/**
 * Sections livrées. Les sections restantes (catégories, revendeurs et territoires,
 * articles, pages, échéances, comptes clients, créneaux, journal) suivent exactement
 * le motif de /admin/produits : une page liste + une page [id] avec formulaire et
 * une action serveur dans src/server/actions/admin.ts. Voir README « Back-office ».
 */
const SECTIONS = [
  { titre: "Catalogue", liens: [["/admin/produits", "Produits"]] },
  { titre: "Contenu", liens: [["/admin/pages", "Pages"], ["/admin/articles", "Articles du blog"]] },
  { titre: "Commercial", liens: [["/admin/commandes", "Commandes et devis"], ["/admin/demandes", "Demandes reçues"]] },
  { titre: "Système", liens: [["/admin/reglages", "Réglages"]] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  // Page de connexion du back-office : pas de coquille, mais un repere principal.
  if (!user || user.role === "CLIENT") return <main id="contenu">{children}</main>;

  return (
    <div className="admin">
      <a href="#contenu" className="sr-only">Aller au contenu</a>
      <aside className="admin__aside sur-bleu">
        <Link href="/admin" className="marque" style={{ marginBottom: 10 }}>
          <span className="marque__mot" style={{ fontSize: 19 }}>TOP<em>ECO</em></span>
        </Link>
        <p style={{ fontSize: 13, color: "var(--vert-clair)", padding: "0 10px 8px" }}>Back-office</p>

        {SECTIONS.map((s) => (
          <div key={s.titre}>
            <p className="eyebrow">{s.titre}</p>
            {s.liens.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,.22)", paddingTop: 14 }}>
          <p style={{ fontSize: 13, color: "var(--sur-bleu)", padding: "0 10px 10px" }}>{user.name} · {user.role}</p>
          <Link href="/" target="_blank">Voir le site ↗</Link>
          <form action={logoutAction} style={{ padding: "8px 10px" }}>
            <button type="submit" className="btn btn--contour-blanc" style={{ minHeight: 40, padding: "9px 14px", fontSize: 13 }}>Se déconnecter</button>
          </form>
        </div>
      </aside>

      <main className="admin__main" id="contenu">{children}</main>
    </div>
  );
}
