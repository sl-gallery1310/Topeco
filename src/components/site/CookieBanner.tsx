"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Bandeau cookies conforme CNIL :
 * - rien de non essentiel ne s’exécute avant le choix ;
 * - refuser est aussi accessible qu’accepter (même format de bouton, même poids visuel) ;
 * - le choix est persisté (cookie + table CookieConsent) et révocable depuis le pied de page.
 *
 * Le bandeau reste dans le HTML une fois le choix fait, masqué par `hidden` : le lien
 * « Gestion des cookies » (#cookies) a toujours une cible, et le rouvre sur le choix enregistré.
 */

/** Choix posé par /api/consentement, ou null tant que le visiteur n’a pas choisi. */
function lireChoix(): { a: boolean; p: boolean } | null {
  const brut = document.cookie.split("; ").find((c) => c.startsWith("topeco_consent="));
  if (!brut) return null;
  try {
    const v = JSON.parse(decodeURIComponent(brut.slice("topeco_consent=".length)));
    return { a: v.a === true, p: v.p === true };
  } catch {
    return { a: false, p: false };
  }
}

export default function CookieBanner({ policyVersion }: { policyVersion: string }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [perso, setPerso] = useState(false);
  /** Nombre de réouvertures depuis le pied de page : chacune fait entrer le focus dans le bandeau. */
  const [reouvertures, setReouvertures] = useState(0);
  const bandeau = useRef<HTMLDivElement>(null);
  const retourFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Le cookie n'existe pas au rendu serveur : l'ouverture ne peut être décidée
    // qu'au montage, côté navigateur. Exécuté une seule fois (dépendances vides).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!lireChoix()) setOpen(true);
    const reopen = () => {
      const choix = lireChoix();
      setAnalytics(choix?.a ?? false);
      setPerso(choix?.p ?? false);
      retourFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDetail(true);
      setOpen(true);
      setReouvertures((n) => n + 1);
    };
    window.addEventListener("topeco:cookies:open", reopen);
    return () => window.removeEventListener("topeco:cookies:open", reopen);
  }, []);

  // Après le rendu, le bandeau n'est plus `hidden` et peut recevoir le focus. L'ouverture
  // automatique de la première visite, elle, ne déplace pas le focus.
  useEffect(() => {
    if (reouvertures > 0) bandeau.current?.focus();
  }, [reouvertures]);

  async function save(choice: { analytics: boolean; personalisation: boolean }) {
    try {
      await fetch("/api/consentement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...choice, policyVersion }),
      });
    } catch {
      // Hors ligne : rien n'est enregistré, le bandeau reviendra à la prochaine visite.
    }
    setOpen(false);
    retourFocus.current?.focus();
    retourFocus.current = null;
  }

  return (
    <div ref={bandeau} className="bandeau-cookies" role="dialog" aria-label="Gestion des cookies" id="cookies" tabIndex={-1} hidden={!open}>
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
          <button type="button" className="btn btn--bleu" onClick={() => save({ analytics: false, personalisation: false })}>
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
          <button type="button" className="btn btn--bleu" onClick={() => save({ analytics: true, personalisation: true })}>
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
