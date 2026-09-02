"use client";
import { useActionState, useState } from "react";
import { submitAppointment, type FormState } from "@/server/actions/forms";
import { DEMO_FORM_NOTICE } from "@/lib/constants";

const initial: FormState = { ok: false };

export default function AppointmentForm({ slots }: { slots: { id: number; label: string; full: boolean }[] }) {
  const [state, action, pending] = useActionState(submitAppointment, initial);
  const [slotId, setSlotId] = useState(slots.find((s) => !s.full)?.id ?? 0);
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <section className="section--bleu sur-bleu" style={{ marginTop: 34, padding: "clamp(20px,3vw,34px)" }}>
      <h2 style={{ fontSize: "clamp(21px,2.2vw,27px)" }}>Prendre rendez-vous avec un commercial</h2>
      <p style={{ marginTop: 10, maxWidth: "60ch" }}>
        Trente minutes, par téléphone ou en visite dans votre établissement. Sans engagement.
      </p>

      {state.ok ? (
        <div className="panneau panneau--creme" style={{ marginTop: 24 }}>
          <h3>Rendez-vous demandé</h3>
          <p style={{ marginTop: 10, color: "var(--texte-2)" }}>
            Créneau retenu : {state.message}. Un conseiller confirme par téléphone.
          </p>
          <p style={{ marginTop: 10, fontSize: 14, color: "var(--texte-3)" }}>{DEMO_FORM_NOTICE}</p>
          <button type="button" className="btn btn--contour-bleu" style={{ marginTop: 18 }} onClick={() => location.reload()}>
            Choisir un autre créneau
          </button>
        </div>
      ) : (
        <form action={action} className="panneau panneau--creme" style={{ marginTop: 24 }} noValidate>
          <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
          <input type="hidden" name="slotId" value={slotId} />

          {err("_form") && <p className="erreur" role="alert">{err("_form")}</p>}

          <fieldset>
            <legend>Choisir un créneau</legend>
            <div role="radiogroup" aria-label="Créneaux disponibles" className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginTop: 12 }}>
              {slots.map((s) => {
                const selected = s.id === slotId;
                return (
                  <button
                    key={s.id} type="button" role="radio" aria-checked={selected} disabled={s.full}
                    onClick={() => setSlotId(s.id)}
                    style={{
                      textAlign: "left", minHeight: 46, padding: "12px 14px", cursor: s.full ? "not-allowed" : "pointer",
                      font: "600 14px/1.3 var(--titre)",
                      background: selected ? "var(--bleu)" : "var(--blanc)",
                      color: selected ? "var(--blanc)" : s.full ? "var(--texte-4)" : "var(--texte)",
                      border: selected ? "1px solid var(--bleu)" : "1px solid var(--bordure)",
                    }}
                  >
                    {s.label}{s.full ? " — complet" : ""}
                  </button>
                );
              })}
            </div>
            {err("slotId") && <p className="erreur" style={{ marginTop: 8 }}>{err("slotId")}</p>}
          </fieldset>

          <div className="admin__grille-champs" style={{ marginTop: 22 }}>
            {[
              ["companyName", "Établissement", "text", true],
              ["managerName", "Nom du gérant", "text", true],
              ["phone", "Téléphone", "tel", true],
              ["email", "E-mail", "email", true],
            ].map(([name, label, type, req]) => (
              <div key={String(name)} className={"champ" + (err(String(name)) ? " champ--erreur" : "")}>
                <label htmlFor={String(name)}>{label}{req ? " *" : ""}</label>
                <input id={String(name)} name={String(name)} type={String(type)} required={Boolean(req)} />
                {err(String(name)) && <p className="erreur">{err(String(name))}</p>}
              </div>
            ))}

            <div className="champ">
              <label htmlFor="format">Format du rendez-vous</label>
              <select id="format" name="format" defaultValue="TELEPHONE">
                <option value="TELEPHONE">Par téléphone</option>
                <option value="VISITE">Visite dans mon établissement</option>
                <option value="VISIO">Visioconférence</option>
              </select>
            </div>

            <div className={"champ" + (err("department") ? " champ--erreur" : "")}>
              <label htmlFor="department">Département *</label>
              <input id="department" name="department" inputMode="numeric" maxLength={3} required placeholder="75" />
              {err("department") && <p className="erreur">{err("department")}</p>}
            </div>
          </div>

          <div className="champ" style={{ marginTop: 18 }}>
            <label htmlFor="needsText">Description du besoin</label>
            <textarea id="needsText" name="needsText" rows={4}
              placeholder="Références actuelles, volumes mensuels, échéances qui vous inquiètent." />
          </div>

          <div className={"champ" + (err("consentGiven") ? " champ--erreur" : "")} style={{ marginTop: 18 }}>
            <label className="case" style={{ font: "400 15px/1.5 var(--corps)" }}>
              <input type="checkbox" name="consentGiven" required />
              J’accepte d’être contacté au sujet de cette demande. Aucune case n’est cochée par défaut.
            </label>
            {err("consentGiven") && <p className="erreur">{err("consentGiven")}</p>}
          </div>

          <button type="submit" className="btn btn--vert" style={{ marginTop: 20 }} disabled={pending}>
            {pending ? "Envoi…" : "Demander ce rendez-vous"}
          </button>
        </form>
      )}
    </section>
  );
}
