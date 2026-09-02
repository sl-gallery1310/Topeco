import "server-only";
import nodemailer from "nodemailer";

const enabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

const transport = enabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    })
  : null;

/**
 * En l’absence de SMTP configuré (cas du projet étudiant en local), le message
 * est journalisé au lieu d’être envoyé : les formulaires restent testables.
 */
export async function sendMail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!transport) {
    console.info("[mail simulé]", opts.to, "—", opts.subject, "\n" + opts.text);
    return { sent: false as const };
  }
  await transport.sendMail({ from: process.env.MAIL_FROM, ...opts });
  return { sent: true as const };
}

export const MAIL_TO = {
  sales: process.env.MAIL_TO_SALES || "commercial@topeco.fr",
  support: process.env.MAIL_TO_SUPPORT || "contact@topeco.fr",
  network: process.env.MAIL_TO_NETWORK || "reseau@topeco.fr",
};
