"use client";
import { useActionState } from "react";
import { submitResellerApplication, type FormState } from "@/server/actions/forms";
import { DEMO_FORM_NOTICE } from "@/lib/constants";

const initial: FormState = { ok: false };

export default function ApplicationForm({ territories }: { territories: { id: number; regionName: string }[] }) {
  const [state, action, pending] = useActionState(submitResellerApplication, initial);
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <section id="devenir-revendeur" className="section--bleu sur-bleu" style={{ marginTop: 30, padding: "clamp(20px,3vw,36px)" }}>
      <h2 style={{ fontSize: "clamp(21px,2.2vw,27px)" }}>Devenir revendeur</h2>
      <p style={{ marginTop: 12, maxWidth: "62ch" }}>
        Grossistes, distributeurs CHR et enseignes régionales : nous structurons le réseau territoire
        par territoire, avec un seul partenaire principal par zone.
      </p>

      <div className="grille grille--trois" style={{ marginTop: 26 }}>
        {[
          ["Marges revendeur", "Tarif dégressif dès le premier palier, remise réseau sur l’ensemble du catalogue."],
          ["Exclusivité territoriale", "Un partenaire principal par région, contractualisé sur trois ans."],
          ["Kit de démarrage", "Présentoirs, fiches techniques, échantillons et formation réglementaire."],
        ].map(([t, d]) => (
          <div key={t} style={{ borderTop: "3px solid var(--vert)", paddingTop: 18 }}>
            <h3>{t}</h3>
            <p style={{ marginTop: 10, fontSize: 15, color: "var(--sur-bleu)" }}>{d}</p>
          </div>
        ))}
      </div>

      {state.ok ? (
        <div className="panneau panneau--creme" style={{ marginTop: 28, maxWidth: 760 }}>
          <h3>Candidature enregistrée</h3>
          <p style={{ marginTop: 10, color: "var(--texte-2)" }}>
            Notre responsable réseau vous rappelle sous cinq jours ouvrés pour qualifier votre zone.
          </p>
          <p style={{ marginTop: 10, fontSize: 14, color: "var(--texte-3)" }}>{DEMO_FORM_NOTICE}</p>
          <button type="button" className="btn btn--contour-bleu" style={{ marginTop: 18 }} onClick={() => location.reload()}>
            Nouvelle candidature
          </button>
        </div>
      ) : (
        <form action={action} className="panneau panneau--creme" style={{ marginTop: 28, maxWidth: 760 }} noValidate>
          <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />

          {err("_form") && <p className="erreur" role="alert" style={{ marginBottom: 12 }}>{err("_form")}</p>}

          <div className="admin__grille-champs">
            {[
              ["companyName", "Raison sociale", "text", true],
              ["siret", "SIRET", "text", true],
              ["contactName", "Contact", "text", true],
              ["email", "E-mail professionnel", "email", true],
            ].map(([name, label, type, req]) => (
              <div key={String(name)} className={"champ" + (err(String(name)) ? " champ--erreur" : "")}>
                <label htmlFor={String(name)}>{label}{req ? " *" : ""}</label>
                <input id={String(name)} name={String(name)} type={String(type)} required={Boolean(req)}
                  aria-describedby={err(String(name)) ? name + "-err" : undefined} />
                {err(String(name)) && <p className="erreur" id={name + "-err"}>{err(String(name))}</p>}
              </div>
            ))}

            <div className={"champ" + (err("territoryId") ? " champ--erreur" : "")}>
              <label htmlFor="territoryId">Zone visée *</label>
              <select id="territoryId" name="territoryId" required defaultValue="">
                <option value="" disabled>Choisir une zone</option>
                {territories.map((t) => <option key={t.id} value={t.id}>{t.regionName}</option>)}
              </select>
              {err("territoryId") && <p className="erreur">{err("territoryId")}</p>}
            </div>

            <div className="champ">
              <label htmlFor="annualRevenueBand">Chiffre d’affaires CHR annuel</label>
              <select id="annualRevenueBand" name="annualRevenueBand" defaultValue="">
                <option value="">Non renseigné</option>
                <option value="UNDER_500K">Moins de 500 k€</option>
                <option value="BETWEEN_500K_2M">500 k€ à 2 M€</option>
                <option value="OVER_2M">Plus de 2 M€</option>
              </select>
            </div>
          </div>

          <div className="champ" style={{ marginTop: 18 }}>
            <label htmlFor="clientsAndVolumes">Clientèle actuelle et volumes envisagés</label>
            <textarea id="clientsAndVolumes" name="clientsAndVolumes" rows={4} />
          </div>

          <button type="submit" className="btn btn--vert" style={{ marginTop: 20 }} disabled={pending}>
            {pending ? "Envoi…" : "Envoyer ma candidature"}
          </button>
        </form>
      )}
    </section>
  );
}
