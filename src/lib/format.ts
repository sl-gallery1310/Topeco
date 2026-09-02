/**
 * Formatage fr-FR. Règle de la charte : le prix est TOUJOURS affiché HT et TTC.
 * Les montants circulent en centimes HT (Int) dans toute l’application.
 */

const NBSP = "\u00A0"; // espace insécable : 39,90 € / 20 % / 48 h
const NNBSP = "\u202F"; // espace fine insécable : séparateur de milliers

const money = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 3990 -> "39,90 €" (avec espace insécable) */
export function euros(cents: number): string {
  return money.format(cents / 100).replace(/\u202F|\u00A0/g, NNBSP) + NBSP + "€";
}

/** 3990 -> "39,90 € HT" */
export const eurosHt = (cents: number) => euros(cents) + NBSP + "HT";
/** 3990 -> "47,88 € TTC" */
export const eurosTtc = (cents: number) => euros(cents) + NBSP + "TTC";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
/** Date -> "18 avril 2026" */
export const frDate = (d: Date | string) => dateFmt.format(new Date(d));

/** "6 min de lecture", calculé à partir du corps (≈ 220 mots/min) */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** 184320 -> "180 ko" */
export function fileSize(bytes: number): string {
  if (bytes < 1024) return bytes + NBSP + "o";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + NBSP + "ko";
  return money.format(bytes / (1024 * 1024)) + NBSP + "Mo";
}

/** Insère les espaces insécables réglementaires dans un texte saisi au back-office. */
export function typography(text: string): string {
  return text
    .replace(/ ([%€])/g, NBSP + "$1")
    .replace(/(\d) (h|km|kg|ml|cm)\b/g, "$1" + NBSP + "$2")
    .replace(/ ([:;!?])/g, NBSP + "$1")
    .replace(/'/g, "’");
}
