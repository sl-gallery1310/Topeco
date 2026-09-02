"use client";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const MATERIAL_LABELS: Record<string, string> = {
  FIBRE_MOULEE: "Fibre moulée",
  CARTON_CERTIFIE: "Carton certifié",
  KRAFT_BRUT: "Kraft brut",
  PET_RECYCLE: "PET recyclé",
  INOX: "Inox",
  AUTRE: "Autre",
};
const CAPACITIES = [
  ["moins-500", "Moins de 500 ml"],
  ["500-1000", "500 à 1 000 ml"],
  ["plus-1000", "Plus de 1 000 ml"],
];

/** Les filtres sont reflétés dans l’URL (?materiau=…&prixMax=…) : partageable, indexable, sans rechargement complet. */
export default function Filters({
  materials,
  selected,
}: {
  materials: string[];
  selected: { materiau: string[]; contenance: string[]; prixMax: number };
}) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState(selected);

  function toggle(key: "materiau" | "contenance", value: string) {
    setDraft((d) => {
      const list = d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value];
      return { ...d, [key]: list };
    });
  }

  function apply() {
    const next = new URLSearchParams(params.toString());
    next.delete("materiau"); next.delete("contenance"); next.delete("prixMax");
    draft.materiau.forEach((v) => next.append("materiau", v));
    draft.contenance.forEach((v) => next.append("contenance", v));
    if (draft.prixMax < 60) next.set("prixMax", String(draft.prixMax));
    router.push(path + "?" + next.toString(), { scroll: false });
  }

  const slug = (m: string) => m.toLowerCase().replace(/_/g, "-");

  return (
    <aside className="panneau" aria-label="Filtres" style={{ padding: 22 }}>
      <h2 style={{ fontSize: 20 }}>Filtrer</h2>

      <fieldset style={{ marginTop: 20, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Matériau</legend>
        <div style={{ marginTop: 8 }}>
          {materials.map((m) => (
            <label key={m} className="case">
              <input type="checkbox" checked={draft.materiau.includes(slug(m))} onChange={() => toggle("materiau", slug(m))} />
              {MATERIAL_LABELS[m] ?? m}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 20, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Contenance</legend>
        <div style={{ marginTop: 8 }}>
          {CAPACITIES.map(([value, label]) => (
            <label key={value} className="case">
              <input type="checkbox" checked={draft.contenance.includes(value)} onChange={() => toggle("contenance", value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 20, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Prix HT par lot</legend>
        <label htmlFor="prixMax" style={{ display: "block", marginTop: 10, font: "600 14.5px/1.4 var(--titre)" }}>
          Jusqu’à {draft.prixMax}&nbsp;€ HT
        </label>
        <input
          id="prixMax" name="prixMax" type="range" min={5} max={60} step={1}
          value={draft.prixMax}
          onChange={(e) => setDraft((d) => ({ ...d, prixMax: Number(e.target.value) }))}
          style={{ width: "100%", marginTop: 10 }}
        />
      </fieldset>

      <button type="button" className="btn btn--bleu btn--pleine-largeur" style={{ marginTop: 22 }} onClick={apply}>
        Appliquer les filtres
      </button>
    </aside>
  );
}
