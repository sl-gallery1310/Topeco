import Link from "next/link";
import Image from "next/image";
import ReopenCookies from "./ReopenCookies";

const COLONNES = [
  {
    titre: "Boutique",
    liens: [
      { href: "/boutique/emballages", label: "Emballages" },
      { href: "/boutique/consommables", label: "Consommables" },
      { href: "/boutique/hygiene", label: "Hygiène" },
      { href: "/boutique/pailles-inox", label: "Pailles inox" },
    ],
  },
  {
    titre: "TOPECO",
    liens: [
      { href: "/nos-revendeurs", label: "Nos revendeurs" },
      { href: "/blog", label: "Blog réglementaire" },
      { href: "/contact", label: "Contact et RDV" },
      { href: "/mon-compte", label: "Mon compte" },
    ],
  },
  {
    titre: "Informations",
    liens: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/cgv", label: "CGV" },
      { href: "/cgu", label: "CGU" },
      { href: "/confidentialite", label: "Politique de confidentialité" },
      { href: "/plan-du-site", label: "Plan du site" },
      { href: "/accessibilite", label: "Accessibilité" },
    ],
  },
];

export default function Footer({ notice, vatNotice }: { notice?: string; vatNotice?: string }) {
  return (
    <footer className="pied sur-bleu">
      <div className="conteneur" style={{ paddingTop: "clamp(32px,4vw,52px)" }}>
        <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          <div>
            <Link href="/" className="marque" aria-label="TOPECO — accueil">
              {/* Décoratif : le lien est nommé par aria-label et le mot TOPECO suit. */}
              <Image src="/mark-white.svg" alt="" aria-hidden="true" width={30} height={30} />
              <span className="marque__mot" style={{ fontSize: 20 }}>TOP<em>ECO</em></span>
            </Link>
            <p style={{ marginTop: 14, fontSize: 14.5, color: "var(--sur-bleu)" }}>
              L’emballage qui vous met au sommet. Marque de GWESERG, SARL fondée en 2012.
            </p>
          </div>

          {COLONNES.map((col) => (
            <div key={col.titre}>
              <h2>{col.titre}</h2>
              <div style={{ marginTop: 8 }}>
                {col.liens.map((l) => (
                  <Link key={l.href} href={l.href}>{l.label}</Link>
                ))}
                {col.titre === "Informations" && <ReopenCookies />}
              </div>
            </div>
          ))}
        </div>

        <div className="pied__bas">
          <span>{vatNotice ?? "Tous nos prix sont affichés hors taxes et toutes taxes comprises."}</span>
          <span>{notice ?? "© 2026 TOPECO — projet étudiant fictif : aucun achat et aucune réservation ne peuvent être effectués sur ce site."}</span>
        </div>
      </div>
    </footer>
  );
}
