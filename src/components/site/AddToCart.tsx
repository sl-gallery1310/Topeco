"use client";
import { useState, useTransition } from "react";

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/**
 * En mode projet étudiant (NEXT_PUBLIC_DEMO_MODE=true), le bouton n’ouvre aucun
 * tunnel de commande : il confirme l’ajout et rappelle l’avertissement.
 * En mode réel, il appelle /api/panier et l’écran panier (à concevoir) prend le relais.
 */
export default function AddToCart({ productId, qty = 1, label = "Ajouter au panier" }: { productId: number; qty?: number; label?: string }) {
  const [state, setState] = useState<"idle" | "done">("idle");
  const [pending, start] = useTransition();

  function add() {
    start(async () => {
      await fetch("/api/panier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty }),
      });
      setState("done");
    });
  }

  return (
    <div>
      <button type="button" className="btn btn--vert btn--pleine-largeur" onClick={add} disabled={pending}>
        {pending ? "Ajout…" : state === "done" ? "Ajouté au panier" : label}
      </button>
      {state === "done" && DEMO && (
        <p role="status" style={{ marginTop: 8, fontSize: 13.5, color: "var(--texte-3)" }}>
          Démonstration : aucun achat ne peut être effectué sur ce site.
        </p>
      )}
    </div>
  );
}
