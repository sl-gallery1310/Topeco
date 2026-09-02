"use client";
import { useEffect, useState } from "react";

/**
 * Bandeau cookies conforme CNIL :
 * - rien de non essentiel ne s’exécute avant le choix ;
 * - refuser est aussi accessible qu’accepter (même poids visuel) ;
 * - le choix est persisté (cookie + table CookieConsent) et révocable depuis le pied de page.
 */
export default function CookieBanner({ policyVersion }: { policyVersion: string }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [perso, setPerso] = useState(false);

  useEffect(() => {
    const decided = document.cookie.includes("topeco_consent=");
    // Le cookie n'existe pas au rendu serveur : l'ouverture ne peut être décidée
    // qu'au montage, côté navigateur. Exécuté une seule fois (dépendances vides).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!decided) setOpen(true);
    const reopen = () => { setOpen(true); setDetail(true); };
    window.addEventListener("topeco:cookies:open", reopen);
    return () => window.removeEventListener("topeco:cookies:open", reopen);
  }, []);

  async function save(choice: { analytics: boolean; personalisation: boolean }) {
    await fetch("/api/consentement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...choice, policyVersion }),
    });
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="bandeau-cookies" role="dialog" aria-label="Gestion des cookies" id="cookies">
      <div className="conteneur" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "center", padding: 0 }}>
        <div>
          <h2 style={{ fontSize: 17 }}>Cookies</h2>
          <p style={{ marginTop: 8, fontSize: 15, color: "var(--texte-2)" }}>
            Nous utilisons des cookies nécessaires au fonctionnement du site. Les cookies de mesure
            d’audience et de personnalisation ne sont déposés qu’avec votre accord.
          </p>
          {detail && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
              <label className="case"><input type="checkbox" checked disabled /> Nécessaires (obligatoires)</label>
              <label className="case"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Mesure d’audience</label>
              <label className="case"><input type="checkbox" checked={perso} onChange={(e) => setPerso(e.target.checked)} /> Personnalisation</label>
            </div>
          )}
        </div>

        <div className="bandeau-cookies__actions" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn--contour-bleu" onClick={() => save({ analytics: false, personalisation: false })}>
            Tout refuser
          </button>
          {detail ? (
            <button type="button" className="btn btn--contour-bleu" onClick={() => save({ analytics, personalisation: perso })}>
              Enregistrer mes choix
            </button>
          ) : (
            <button type="button" className="btn btn--contour-bleu" onClick={() => setDetail(true)} aria-expanded={detail}>
              Personnaliser
            </button>
          )}
          <button type="button" className="btn btn--vert" onClick={() => save({ analytics: true, personalisation: true })}>
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
