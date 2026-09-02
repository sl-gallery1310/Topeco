"use client";
import { useState, useTransition } from "react";

type Result = { id: number; companyName: string; regionLabel: string; city: string | null; postcode: string | null; distanceKm?: number };

/** Recherche revendeur par ville ou code postal (page revendeurs et fiche produit). */
export default function DealerSearchForm({ productId, onDark = false }: { productId?: number; onDark?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const p = new URLSearchParams({ q: query });
      if (productId) p.set("produit", String(productId));
      const res = await fetch("/api/revendeurs?" + p.toString());
      const data = await res.json();
      setResults(data.results ?? []);
    });
  }

  return (
    <div>
      <form onSubmit={submit} style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 520 }}>
        <label className="sr-only" htmlFor={"recherche-revendeur-" + (productId ?? "global")}>Ville ou code postal</label>
        <input
          id={"recherche-revendeur-" + (productId ?? "global")}
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ville ou code postal"
          required
          minLength={2}
          style={{ flex: "1 1 220px", padding: 13, minHeight: 46, border: onDark ? "0" : "1px solid var(--bordure)", background: "var(--blanc)", font: "400 16px/1.5 var(--corps)" }}
        />
        <button type="submit" className="btn btn--vert" disabled={pending}>{pending ? "Recherche…" : "Rechercher"}</button>
      </form>

      {results !== null && (
        <div aria-live="polite" style={{ marginTop: 16 }}>
          {results.length === 0 ? (
            <p style={{ fontSize: 15, color: onDark ? "var(--sur-bleu)" : "var(--texte-3)" }}>
              Aucun revendeur trouvé pour « {query} ». Commandez en ligne, ou candidatez pour ce territoire depuis la page revendeurs.
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map((r) => (
                <li key={r.id} style={{ fontSize: 15 }}>
                  <strong style={{ fontFamily: "var(--titre)" }}>{r.companyName}</strong>
                  {" — "}{r.city ?? r.regionLabel}{r.postcode ? " (" + r.postcode + ")" : ""}
                  {r.distanceKm !== undefined && " · " + Math.round(r.distanceKm) + " km"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
