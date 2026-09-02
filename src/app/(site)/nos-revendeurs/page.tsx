import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import DealerSearchForm from "@/components/site/DealerSearchForm";
import ResellerMap from "@/components/site/ResellerMap";
import ApplicationForm from "./ApplicationForm";

export const metadata: Metadata = {
  title: "Nos revendeurs",
  description: "Trouvez un revendeur TOPECO près de vous, ou candidatez pour distribuer la marque sur votre territoire.",
};

export default async function ResellersPage() {
  const [resellers, territories] = await Promise.all([
    db.reseller.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    db.territory.findMany({ where: { status: { in: ["AVAILABLE", "PROSPECTING"] } }, orderBy: { regionName: "asc" } }),
  ]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Nos revendeurs" }]} />

      <div className="conteneur" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <h1>Nos revendeurs</h1>
        <p className="intro" style={{ marginTop: 14 }}>
          Nous livrons directement en Île-de-France. Partout ailleurs, nos produits sont distribués
          par un réseau de partenaires. Deux entrées sur cette page : trouver un revendeur, ou devenir le nôtre.
        </p>

        <section className="panneau" style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: "clamp(21px,2.2vw,27px)" }}>Trouver un revendeur</h2>
          <DealerSearchForm />

          <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, marginTop: 28, alignItems: "start" }}>
            <div className="panneau panneau--creme">
              <h3 className="eyebrow">Couverture du réseau</h3>
              <ResellerMap resellers={resellers} />
              <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                {[
                  ["#2B4A9B", "Livraison directe TOPECO", false],
                  ["#5F7F2B", "Revendeur partenaire", false],
                  ["#FFFFFF", "Territoire disponible", true],
                ].map(([color, label, ring]) => (
                  <li key={String(label)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span aria-hidden="true" style={{ width: 13, height: 13, borderRadius: "50%", background: String(color), border: ring ? "2px solid #582900" : "none", flex: "none" }} />
                    {label}
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: 14, fontSize: 13.5, color: "var(--texte-3)" }}>
                Fond de carte OpenStreetMap. Marseille signale un territoire encore disponible.
              </p>
            </div>

            <div>
              {resellers.map((r, i) => (
                <div key={r.id} style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: i === resellers.length - 1 ? "none" : "1px solid var(--bordure)" }}>
                  <div>
                    <p style={{ font: "600 16px/1.3 var(--titre)", color: "var(--bleu)" }}>{r.regionLabel}</p>
                    <p style={{ marginTop: 4, fontSize: 14, color: "var(--texte-3)" }}>{r.companyName}</p>
                  </div>
                  {r.ctaHref ? (
                    <Link href={r.ctaHref} style={{ fontSize: 14.5 }}>{r.ctaLabel ?? "En savoir plus"}</Link>
                  ) : (
                    <span style={{ fontSize: 14, color: "var(--texte-3)" }}>
                      {r.pickupPointCount} point{r.pickupPointCount > 1 ? "s" : ""} de retrait
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <ApplicationForm territories={territories.map((t) => ({ id: t.id, regionName: t.regionName }))} />
      </div>
    </>
  );
}
