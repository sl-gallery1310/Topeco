"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { resolvePrice, type Tier } from "@/lib/pricing";
import { eurosHt, eurosTtc } from "@/lib/format";
import AddToCart from "@/components/site/AddToCart";

/**
 * Prix + paliers + sélecteur de quantité.
 * Le calcul est répliqué ici pour l’affichage immédiat, mais la source de vérité
 * reste le serveur : /api/panier recalcule le palier et la remise avant écriture.
 */
export default function BuyBox({
  productId, basePriceHt, vatRate, discountPct, tiers, sampleAvailable,
}: {
  productId: number;
  basePriceHt: number;
  vatRate: number;
  discountPct: number;
  tiers: Tier[];
  sampleAvailable: boolean;
}) {
  const [qty, setQty] = useState(2);
  const price = useMemo(
    () => resolvePrice({ basePriceHt, tiers, qty, vatRate, discountPct }),
    [basePriceHt, tiers, qty, vatRate, discountPct],
  );

  return (
    <div>
      <div className="prix prix--grand" style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginTop: 20 }}>
        <span className="prix__ht">{eurosHt(price.unitPriceHt)}</span>
        <span className="prix__ttc">{eurosTtc(price.unitPriceTtc)}</span>
      </div>
      {discountPct > 0 && (
        <p style={{ marginTop: 6, fontSize: 14.5, color: "var(--texte-3)" }}>
          Remise contractuelle de {discountPct}&nbsp;% appliquée (tarif catalogue {eurosHt(price.listUnitPriceHt)}).
        </p>
      )}

      {tiers.length > 0 && (
        <table className="tableau" style={{ marginTop: 24 }}>
          <caption>Paliers dégressifs par quantité</caption>
          <thead>
            <tr>
              <th scope="col">Lots commandés</th>
              <th scope="col">Prix HT</th>
              <th scope="col">Prix TTC</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t) => {
              const current = price.tier?.minQty === t.minQty;
              const unit = Math.round(t.unitPriceHt * (1 - discountPct / 100));
              return (
                <tr key={t.minQty} aria-selected={current}>
                  <th scope="row" style={{ fontWeight: current ? 700 : 400 }}>
                    {t.maxQty === null ? t.minQty + " et plus" : t.minQty + " – " + t.maxQty}
                  </th>
                  <td>{eurosHt(unit)}</td>
                  <td>{eurosTtc(Math.round(unit * (1 + vatRate)))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "stretch", marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--bordure)", background: "var(--blanc)" }}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuer la quantité"
            style={{ width: 46, height: 46, border: 0, background: "none", color: "var(--bleu)", font: "600 20px/1 var(--titre)", cursor: "pointer" }}>−</button>
          <span aria-live="polite" style={{ minWidth: 48, textAlign: "center", font: "600 16px/1 var(--titre)" }}>
            <label className="sr-only" htmlFor="qte">Quantité</label>
            <input id="qte" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              style={{ width: 48, border: 0, textAlign: "center", font: "600 16px/1 var(--titre)" }} />
          </span>
          <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Augmenter la quantité"
            style={{ width: 46, height: 46, border: 0, background: "none", color: "var(--bleu)", font: "600 20px/1 var(--titre)", cursor: "pointer" }}>+</button>
        </div>
        <div style={{ flex: "1 1 200px", minWidth: 200 }}>
          <AddToCart productId={productId} qty={qty} />
        </div>
      </div>

      <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--texte-3)" }}>
        Total pour {qty} lot{qty > 1 ? "s" : ""} : {eurosHt(price.totalHt)} / {eurosTtc(price.totalTtc)}
      </p>

      {sampleAvailable && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 18 }}>
          <Link href={"/contact?objet=echantillon&produit=" + productId} className="btn btn--contour-bleu">
            Demander un échantillon gratuit
          </Link>
        </div>
      )}
    </div>
  );
}
