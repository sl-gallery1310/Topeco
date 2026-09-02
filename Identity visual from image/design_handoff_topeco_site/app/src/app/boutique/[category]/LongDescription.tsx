"use client";
import { useState } from "react";

/** Présentation SEO dépliable — aria-expanded + aria-controls, libellé qui bascule. */
export default function LongDescription({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      {open && (
        <div
          id="presentation-complete"
          className="intro"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      <button type="button" className="bouton-texte" aria-expanded={open} aria-controls="presentation-complete" onClick={() => setOpen((v) => !v)}>
        {open ? "Réduire la présentation −" : "Lire la présentation complète +"}
      </button>
    </div>
  );
}
