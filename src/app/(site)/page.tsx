import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { priceFrom, ttc } from "@/lib/pricing";
import { eurosHt, eurosTtc } from "@/lib/format";
import ImagePlaceholder from "@/components/site/ImagePlaceholder";

export const revalidate = 300;

export default async function Home() {
  const categories = await db.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { products: { where: { published: true }, select: { basePriceHt: true, priceTiers: true } } },
  });

  return (
    <>
      {/* 1 — Hero */}
      <section className="section section--bleu sur-bleu" style={{ paddingBlock: "clamp(40px,5vw,76px)" }}>
        <div className="conteneur grille grille--deux" style={{ alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "clamp(30px,4vw,50px)", lineHeight: 1.12, letterSpacing: "-0.02em" }}>
              Vos emballages alimentaires 100 % recyclables
            </h1>
            <hr className="filet" />
            <p className="lede" style={{ marginTop: 20 }}>
              Conseil réglementaire inclus sur chaque commande, et livraison en 48 h en Île-de-France.
              Nos partenaires revendeurs couvrent le reste de la France.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 26 }}>
              <Link href="/boutique/emballages" className="btn btn--vert">Voir le catalogue</Link>
              <Link href="/contact" className="btn btn--contour-blanc">Prendre RDV avec un conseiller</Link>
            </div>
          </div>
          <div style={{ justifySelf: "center" }}>
            {/* À remplacer par une photographie produit réelle */}
            <Image src="/mark-white.svg" alt="" width={300} height={300} style={{ width: "min(300px, 70%)", height: "auto" }} priority />
          </div>
        </div>
      </section>

      {/* 2 — Catégories */}
      <section className="section section--creme">
        <div className="conteneur">
          <h2>Nos catégories</h2>
          <p style={{ marginTop: 12, color: "var(--texte-2)", maxWidth: "62ch" }}>
            Quatre familles, une seule facture. Tous nos prix sont affichés hors taxes et toutes taxes comprises.
          </p>
          <div className="grille grille--categories" style={{ marginTop: 26 }}>
            {categories.map((c) => {
              const from = priceFrom(c.products);
              return (
                <Link key={c.id} href={`/boutique/${c.slug}`} className="carte">
                  {c.imageUrl ? (
                    <Image src={c.imageUrl} alt={c.imageAlt ?? ""} width={460} height={168} style={{ width: "100%", height: 168, objectFit: "cover" }} />
                  ) : (
                    <ImagePlaceholder height={168} label={c.placeholderLabel ?? "VISUEL À VENIR"} />
                  )}
                  <div className="carte__corps">
                    <h3>{c.name}</h3>
                    <p style={{ fontSize: 14.5, color: "var(--texte-3)" }}>{c.shortDescription}</p>
                    {from !== null && (
                      <p className="prix--des carte__bas" style={{ paddingTop: 8 }}>
                        dès {eurosHt(from)} / {eurosTtc(ttc(from))}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 — Loi AGEC */}
      <section className="section section--blanc">
        <div className="conteneur grille grille--deux" style={{ alignItems: "center" }}>
          <div>
            <p className="eyebrow">Réglementation</p>
            <h2 style={{ marginTop: 12 }}>Loi AGEC : où en êtes-vous ?</h2>
            <p style={{ marginTop: 14, color: "var(--texte-2)", maxWidth: "54ch" }}>
              Chaque échéance retire du marché une famille d’articles à usage unique. Nous reprenons
              votre liste d’achats ligne par ligne et proposons un équivalent conforme, chiffré.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
              <Link href="/blog/calendrier-loi-agec" className="btn btn--vert">Lire le dossier réglementaire</Link>
              <Link href="/contact" className="btn btn--contour-bleu">Faire auditer mes références</Link>
            </div>
          </div>
          <aside className="encadre-vert">
            <h3>Trois questions pour situer votre établissement</h3>
            <ol style={{ marginTop: 14, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 10, color: "var(--texte-2)" }}>
              <li>Servez-vous encore des couverts ou pailles en plastique à usage unique ?</li>
              <li>Vos contenants de vente à emporter passent-ils au four ou au micro-ondes ?</li>
              <li>Savez-vous quelle filière de recyclage accepte vos emballages actuels ?</li>
            </ol>
            <p style={{ marginTop: 14, fontSize: 15, color: "var(--texte-3)" }}>
              Une réponse « non » ou « je ne sais pas » suffit à demander un audit gratuit.
            </p>
          </aside>
        </div>
      </section>

      {/* 4 — RDV */}
      <section className="section section--bleu sur-bleu">
        <div className="conteneur">
          <h2>Prendre RDV avec un commercial</h2>
          <div className="grille grille--trois" style={{ marginTop: 28 }}>
            {[
              ["01", "Vous choisissez un créneau", "Trente minutes, par téléphone ou dans votre établissement."],
              ["02", "Nous auditons vos références", "Liste d’achats, volumes mensuels, échéances applicables."],
              ["03", "Vous recevez un devis chiffré", "Équivalents conformes et différentiel au couvert servi."],
            ].map(([n, titre, texte]) => (
              <div key={n} style={{ borderTop: "3px solid var(--vert)", paddingTop: 18 }}>
                <p style={{ font: "700 30px/1 var(--titre)", color: "var(--vert-clair)" }}>{n}</p>
                <h3 style={{ marginTop: 12 }}>{titre}</h3>
                <p style={{ marginTop: 10, fontSize: 15, color: "var(--sur-bleu)" }}>{texte}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", marginTop: 28 }}>
            <Link href="/contact" className="btn btn--vert">Réserver un créneau</Link>
            <Link href="/nos-revendeurs" className="lien-vert-clair">Trouver un revendeur près de chez moi →</Link>
          </div>
        </div>
      </section>

      {/* 5 — Réassurance */}
      <section className="section section--creme">
        <div className="conteneur grille grille--trois">
          {[
            ["Livraison en 48 h", "En Île-de-France, commande passée avant 15 h expédiée le jour même."],
            ["Conseil réglementaire inclus", "Un conseiller vérifie la conformité de vos références, sans supplément."],
            ["Pailles inox garanties à vie", "Remplacement en cas de déformation ou de corrosion, sans justificatif."],
          ].map(([titre, texte]) => (
            <div key={titre} className="panneau" style={{ padding: 26 }}>
              <Image src="/mark.svg" alt="" width={34} height={34} />
              <h3 style={{ marginTop: 16 }}>{titre}</h3>
              <p style={{ marginTop: 10, fontSize: 15, color: "var(--texte-3)" }}>{texte}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
