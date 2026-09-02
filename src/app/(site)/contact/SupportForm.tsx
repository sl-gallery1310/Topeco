"use client";
import { useActionState } from "react";
import { submitSupportRequest, type FormState } from "@/server/actions/forms";

const initial: FormState = { ok: false };

export default function SupportForm() {
  const [state, action, pending] = useActionState(submitSupportRequest, initial);
  const err = (k: string) => state.errors?.[k]?.[0];

  if (state.ok) {
    return (
      <section className="encadre-vert">
        <h2 style={{ fontSize: 22 }}>Question générale ou SAV</h2>
        <p style={{ marginTop: 12, color: "var(--texte-2)" }}>{state.message}</p>
      </section>
    );
  }

  return (
    <section className="panneau">
      <h2 style={{ fontSize: 22 }}>Question générale ou SAV</h2>
      <p style={{ marginTop: 10, fontSize: 15, color: "var(--texte-3)" }}>
        Livraison, facture, produit défectueux, demande de fiche technique.
      </p>

      <form action={action} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 16 }} noValidate>
        <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
        {err("_form") && <p className="erreur" role="alert">{err("_form")}</p>}

        <div className="champ">
          <label htmlFor="subject">Objet</label>
          <select id="subject" name="subject" defaultValue="SUIVI_COMMANDE">
            <option value="SUIVI_COMMANDE">Suivi de commande</option>
            <option value="FACTURE_DEVIS">Facture ou devis</option>
            <option value="PRODUIT_DEFECTUEUX">Produit défectueux</option>
            <option value="FICHE_TECHNIQUE">Fiche technique ou recyclabilité</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>

        <div className="champ">
          <label htmlFor="orderReference">Numéro de commande</label>
          <input id="orderReference" name="orderReference" placeholder="Optionnel" />
        </div>

        <div className={"champ" + (err("email") ? " champ--erreur" : "")}>
          <label htmlFor="sav-email">E-mail *</label>
          <input id="sav-email" name="email" type="email" required />
          {err("email") && <p className="erreur">{err("email")}</p>}
        </div>

        <div className={"champ" + (err("message") ? " champ--erreur" : "")}>
          <label htmlFor="message">Message *</label>
          <textarea id="message" name="message" rows={4} required />
          {err("message") && <p className="erreur">{err("message")}</p>}
        </div>

        <button type="submit" className="btn btn--bleu" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer le message"}
        </button>
      </form>
    </section>
  );
}
