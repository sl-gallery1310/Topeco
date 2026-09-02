"use server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sendMail, MAIL_TO } from "@/lib/mail";
import { fieldErrors, resellerApplicationSchema, appointmentSchema, supportRequestSchema, type FieldErrors } from "@/lib/validation";

export type FormState = { ok: boolean; errors?: FieldErrors; message?: string; data?: Record<string, string> };

const raw = (fd: FormData) => Object.fromEntries(fd.entries()) as Record<string, string>;

/* ---------------------------------------------------- Candidature revendeur */
export async function submitResellerApplication(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = resellerApplicationSchema.safeParse({ ...raw(fd) });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { honeypot, ...data } = parsed.data;
  try {
    const app = await db.resellerApplication.create({ data });
    const territory = await db.territory.findUnique({ where: { id: data.territoryId } });
    await sendMail({
      to: MAIL_TO.network,
      replyTo: data.email,
      subject: `Candidature revendeur — ${data.companyName} (${territory?.regionName ?? "zone inconnue"})`,
      text: [
        `Société : ${data.companyName}`,
        `SIRET : ${data.siret}`,
        `Contact : ${data.contactName} — ${data.email}`,
        `Zone visée : ${territory?.regionName ?? data.territoryId}`,
        `CA CHR : ${data.annualRevenueBand ?? "non renseigné"}`,
        "",
        data.clientsAndVolumes ?? "",
        "",
        `Fiche : /admin/demandes (candidature n° ${app.id})`,
      ].join("\n"),
    });
    return { ok: true, message: "Candidature enregistrée" };
  } catch (e) {
    console.error(e);
    return { ok: false, errors: { _form: ["Une erreur est survenue. Réessayez dans un instant."] } };
  }
}

/* ---------------------------------------------------- Prise de rendez-vous */
export async function submitAppointment(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = appointmentSchema.safeParse({ ...raw(fd), consentGiven: fd.get("consentGiven") === "on" || fd.get("consentGiven") === "true" });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { honeypot, slotId, ...data } = parsed.data;
  const slot = await db.appointmentSlot.findFirst({ where: { id: slotId, published: true } });
  if (!slot) return { ok: false, errors: { slotId: ["Ce créneau n’est plus disponible."] } };
  if (slot.bookedCount >= slot.capacity) return { ok: false, errors: { slotId: ["Ce créneau vient d’être réservé. Choisissez-en un autre."] } };

  try {
    await db.$transaction([
      db.appointment.create({ data: { ...data, slotId: slot.id, slotLabel: slot.label, consentAt: new Date() } }),
      db.appointmentSlot.update({ where: { id: slot.id }, data: { bookedCount: { increment: 1 } } }),
    ]);
    await sendMail({
      to: MAIL_TO.sales,
      replyTo: data.email,
      subject: `RDV demandé — ${data.companyName} (${slot.label})`,
      text: [
        `Créneau : ${slot.label}`,
        `Établissement : ${data.companyName}`,
        `Gérant : ${data.managerName} — ${data.phone} — ${data.email}`,
        `Format : ${data.format} · Département ${data.department}`,
        "",
        data.needsText ?? "",
      ].join("\n"),
    });
    return { ok: true, message: slot.label };
  } catch (e) {
    console.error(e);
    return { ok: false, errors: { _form: ["Une erreur est survenue. Réessayez dans un instant."] } };
  }
}

/* ---------------------------------------------------- Question / SAV */
export async function submitSupportRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = supportRequestSchema.safeParse(raw(fd));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { honeypot, ...data } = parsed.data;
  try {
    await db.supportRequest.create({ data });
    await sendMail({
      to: MAIL_TO.support,
      replyTo: data.email,
      subject: `SAV — ${data.subject}${data.orderReference ? " — " + data.orderReference : ""}`,
      text: `${data.email}\n${data.orderReference ?? ""}\n\n${data.message}`,
    });
    return { ok: true, message: "Message envoyé. Réponse sous 24 h ouvrées." };
  } catch (e) {
    console.error(e);
    return { ok: false, errors: { _form: ["Une erreur est survenue. Réessayez dans un instant."] } };
  }
}

/** Adresse IP du client, pour l’audit et la limitation de débit. */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}
