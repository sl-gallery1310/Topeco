"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { saveProduct, type AdminState } from "@/server/actions/admin";

type Tier = { minQty: number; maxQty: number | null; unitPriceHt: number };
type P = {
  id: number; sku: string; slug: string; categoryId: number; name: string;
  lotLabel: string | null; specLine: string | null; descriptionHtml: string | null;
  bullets: string[]; basePriceHt: number; material: string | null; capacityMl: number | null;
  agecStatus: string; agecDeadline: string; replacementProductId: number | null;
  sampleAvailable: boolean; lifetimeWarranty: boolean; stockStatus: string; published: boolean;
  priceTiers: Tier[];
};

const MATERIALS = [
  ["", "—"], ["FIBRE_MOULEE", "Fibre moulée"], ["CARTON_CERTIFIE", "Carton certifié"],
  ["KRAFT_BRUT", "Kraft brut"], ["PET_RECYCLE", "PET recyclé"], ["INOX", "Inox"], ["AUTRE", "Autre"],
];

export default function ProductForm({
  product, categories, others,
}: {
  product: P | null;
  categories: { id: number; name: string }[];
  others: { id: number; name: string; sku: string }[];
}) {
  const [state, action, pending] = useActionState(saveProduct, {} as AdminState);
  const [tiers, setTiers] = useState<Tier[]>(product?.priceTiers.length ? product.priceTiers : []);
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} className="panneau" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}
      {err("_form") && <p className="erreur" role="alert" style={{ marginBottom: 14 }}>{err("_form")}</p>}

      <div className="admin__grille-champs">
        <div className={"champ" + (err("sku") ? " champ--erreur" : "")}>
          <label htmlFor="sku">SKU *</label>
          <input id="sku" name="sku" defaultValue={product?.sku} placeholder="TPE-INX-050" required />
          {err("sku") && <p className="erreur">{err("sku")}</p>}
        </div>
        <div className={"champ" + (err("slug") ? " champ--erreur" : "")}>
          <label htmlFor="slug">Slug (URL) *</label>
          <input id="slug" name="slug" defaultValue={product?.slug} placeholder="lot-50-pailles-inox" required />
          {err("slug") && <p className="erreur">{err("slug")}</p>}
        </div>
        <div className="champ">
          <label htmlFor="categoryId">Catégorie *</label>
          <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} required>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={"champ" + (err("basePriceHt") ? " champ--erreur" : "")}>
          <label htmlFor="basePriceHt">Prix HT (€) *</label>
          <input id="basePriceHt" name="basePriceHt" type="number" step="0.01" min="0.01" defaultValue={product?.basePriceHt} required />
          {err("basePriceHt") && <p className="erreur">{err("basePriceHt")}</p>}
        </div>
      </div>

      <div className="champ" style={{ marginTop: 18 }}>
        <label htmlFor="name">Nom *</label>
        <input id="name" name="name" defaultValue={product?.name} required />
      </div>

      <div className="admin__grille-champs" style={{ marginTop: 18 }}>
        <div className="champ">
          <label htmlFor="lotLabel">Libellé du lot</label>
          <input id="lotLabel" name="lotLabel" defaultValue={product?.lotLabel ?? ""} placeholder="Lot de 300 · avec couvercle" />
        </div>
        <div className="champ">
          <label htmlFor="specLine">Ligne technique</label>
          <input id="specLine" name="specLine" defaultValue={product?.specLine ?? ""} placeholder="inox 18/8 · 21,5 cm · goupillon inclus" />
        </div>
        <div className="champ">
          <label htmlFor="material">Matériau</label>
          <select id="material" name="material" defaultValue={product?.material ?? ""}>
            {MATERIALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="champ">
          <label htmlFor="capacityMl">Contenance (ml)</label>
          <input id="capacityMl" name="capacityMl" type="number" min="1" defaultValue={product?.capacityMl ?? ""} />
        </div>
      </div>

      <div className="champ" style={{ marginTop: 18 }}>
        <label htmlFor="descriptionHtml">Description technique (HTML simple)</label>
        <textarea id="descriptionHtml" name="descriptionHtml" rows={5} defaultValue={product?.descriptionHtml ?? ""} />
      </div>

      <div className="champ" style={{ marginTop: 18 }}>
        <label htmlFor="bullets">Points clés (une ligne par puce)</label>
        <textarea id="bullets" name="bullets" rows={4} defaultValue={product?.bullets.join("\n")} />
      </div>

      <fieldset style={{ marginTop: 26, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Paliers dégressifs</legend>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--texte-3)" }}>
          Laisser la quantité max vide pour le dernier palier (« 25 et plus »). Prix en euros HT.
        </p>
        <table className="tableau" style={{ marginTop: 12 }}>
          <thead><tr><th scope="col">Qté min</th><th scope="col">Qté max</th><th scope="col">Prix HT (€)</th></tr></thead>
          <tbody>
            {tiers.map((t, i) => (
              <tr key={i}>
                <td><input name={`tier-${i}-minQty`} type="number" min="1" defaultValue={t.minQty} style={{ width: "100%", padding: 8, border: "1px solid var(--bordure)" }} /></td>
                <td><input name={`tier-${i}-maxQty`} type="number" min="1" defaultValue={t.maxQty ?? ""} placeholder="et plus" style={{ width: "100%", padding: 8, border: "1px solid var(--bordure)" }} /></td>
                <td><input name={`tier-${i}-unitPriceHt`} type="number" step="0.01" defaultValue={t.unitPriceHt} style={{ width: "100%", padding: 8, border: "1px solid var(--bordure)" }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {err("tiers") && <p className="erreur">{err("tiers")}</p>}
        <button type="button" className="bouton-texte" style={{ marginTop: 10 }}
          onClick={() => setTiers((t) => [...t, { minQty: t.length ? (t[t.length - 1].maxQty ?? 0) + 1 : 1, maxQty: null, unitPriceHt: 0 }])}>
          Ajouter un palier +
        </button>
      </fieldset>

      <fieldset style={{ marginTop: 26, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Conformité réglementaire</legend>
        <div className="admin__grille-champs" style={{ marginTop: 12 }}>
          <div className="champ">
            <label htmlFor="agecStatus">Statut AGEC</label>
            <select id="agecStatus" name="agecStatus" defaultValue={product?.agecStatus ?? "CONFORME"}>
              <option value="CONFORME">Conforme</option>
              <option value="A_SURVEILLER">À surveiller</option>
              <option value="A_REMPLACER">À remplacer</option>
            </select>
          </div>
          <div className="champ">
            <label htmlFor="agecDeadline">Échéance</label>
            <input id="agecDeadline" name="agecDeadline" type="date" defaultValue={product?.agecDeadline} />
          </div>
          <div className="champ">
            <label htmlFor="replacementProductId">Produit de remplacement</label>
            <select id="replacementProductId" name="replacementProductId" defaultValue={product?.replacementProductId ?? ""}>
              <option value="">—</option>
              {others.map((o) => <option key={o.id} value={o.id}>{o.sku} — {o.name}</option>)}
            </select>
          </div>
          <div className="champ">
            <label htmlFor="stockStatus">Stock</label>
            <select id="stockStatus" name="stockStatus" defaultValue={product?.stockStatus ?? "EN_STOCK"}>
              <option value="EN_STOCK">En stock</option>
              <option value="SUR_COMMANDE">Sur commande</option>
              <option value="EPUISE">Épuisé</option>
              <option value="ARRETE">Arrêté</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 20 }}>
          <label className="case"><input type="checkbox" name="sampleAvailable" defaultChecked={product?.sampleAvailable} /> Échantillon gratuit disponible</label>
          <label className="case"><input type="checkbox" name="lifetimeWarranty" defaultChecked={product?.lifetimeWarranty} /> Garantie à vie</label>
          <label className="case"><input type="checkbox" name="published" defaultChecked={product?.published ?? true} /> Publié</label>
        </div>
      </fieldset>

      <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
        <button type="submit" className="btn btn--vert" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
        <Link href="/admin/produits" className="btn btn--contour-bleu">Annuler</Link>
      </div>
    </form>
  );
}
