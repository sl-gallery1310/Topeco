import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import AppointmentForm from "./AppointmentForm";
import SupportForm from "./SupportForm";

export const metadata: Metadata = {
  title: "Contact et prise de rendez-vous",
  description: "Prenez rendez-vous avec un commercial TOPECO, ou posez une question de service après-vente.",
};

export default async function ContactPage() {
  const [slots, settings] = await Promise.all([
    db.appointmentSlot.findMany({
      where: { published: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 8,
    }),
    getSettings(),
  ]);

  // Repli sur les créneaux du prototype si l’agenda est vide (base fraîchement installée)
  const available = slots.length ? slots : await db.appointmentSlot.findMany({ where: { published: true }, orderBy: { id: "asc" }, take: 4 });

  return (
    <>
      <Breadcrumbs items={[{ label: "Contact et RDV" }]} />

      <div className="conteneur" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)" }}>
        <h1>Contact et prise de rendez-vous</h1>
        <p className="intro" style={{ marginTop: 14 }}>
          Deux formulaires distincts : l’un pour rencontrer un commercial, l’autre pour une question
          de service après-vente ou d’ordre administratif.
        </p>

        <AppointmentForm slots={available.map((s) => ({ id: s.id, label: s.label, full: s.bookedCount >= s.capacity }))} />

        <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 26, marginTop: 30 }}>
          <SupportForm />

          <section className="panneau panneau--creme">
            <h2 style={{ fontSize: 22 }}>Nous joindre</h2>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14, fontSize: 15.5 }}>
              <p><strong style={{ font: "600 15px/1.4 var(--titre)", color: "var(--brun)", display: "block" }}>Téléphone</strong>
                {settings["contact.phone"]} — {settings["contact.hours"]}</p>
              <p><strong style={{ font: "600 15px/1.4 var(--titre)", color: "var(--brun)", display: "block" }}>E-mail</strong>
                <a href={"mailto:" + settings["contact.email"]}>{settings["contact.email"]}</a></p>
              <p><strong style={{ font: "600 15px/1.4 var(--titre)", color: "var(--brun)", display: "block" }}>Entrepôt</strong>
                {settings["contact.warehouse"]}</p>
            </div>

            <h3 style={{ marginTop: 26 }}>Localisation de l’entrepôt</h3>
            <div className="panneau" style={{ marginTop: 14, padding: 20 }}>
              <p style={{ font: "600 16px/1.4 var(--titre)", color: "var(--bleu)" }}>TOPECO — entrepôt Île-de-France</p>
              <p style={{ marginTop: 8, fontSize: 15, color: "var(--texte-3)" }}>{settings["contact.warehouse"]}</p>
              <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--texte-3)" }}>{settings["contact.access"]}</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
