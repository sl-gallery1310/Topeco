/** Validation partagée client/serveur (zod). Messages en français, affichés sous le champ. */
import { z } from "zod";

const required = (label: string) => z.string({ error: label + " est obligatoire." }).trim().min(1, label + " est obligatoire.");

export const email = z.string().trim().min(1, "L’e-mail est obligatoire.").email("Format d’e-mail invalide.");

/** SIRET : 14 chiffres + clé de Luhn */
export const siret = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s/g, ""))
  .refine((v) => /^\d{14}$/.test(v), "Le SIRET comporte 14 chiffres.")
  .refine(luhn, "Ce SIRET est invalide (clé de contrôle).");

function luhn(value: string): boolean {
  let sum = 0;
  for (let i = 0; i < value.length; i++) {
    let d = Number(value[value.length - 1 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

/** Téléphone français : 0X XX XX XX XX ou +33X… */
export const phoneFr = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.\-]/g, ""))
  .refine((v) => /^(?:\+33|0)[1-9]\d{8}$/.test(v), "Numéro de téléphone français attendu.");

export const departement = z
  .string()
  .trim()
  .refine((v) => /^(?:0[1-9]|[1-8]\d|9[0-5]|2A|2B|97[1-6])$/.test(v.toUpperCase()), "Département invalide (01 à 95, 2A, 2B, 971 à 976).");

export const resellerApplicationSchema = z.object({
  companyName: required("La raison sociale"),
  siret,
  contactName: required("Le contact"),
  email,
  territoryId: z.coerce.number().int().positive("La zone visée est obligatoire."),
  annualRevenueBand: z.enum(["UNDER_500K", "BETWEEN_500K_2M", "OVER_2M"]).optional(),
  clientsAndVolumes: z.string().trim().max(2000).optional(),
  // anti-spam : champ caché qui doit rester vide
  honeypot: z.string().max(0, "Requête rejetée.").optional(),
});

export const appointmentSchema = z.object({
  slotId: z.coerce.number().int().positive("Choisissez un créneau."),
  companyName: required("L’établissement"),
  managerName: required("Le nom du gérant"),
  phone: phoneFr,
  email,
  format: z.enum(["TELEPHONE", "VISITE", "VISIO"]).default("TELEPHONE"),
  department: departement,
  needsText: z.string().trim().max(2000).optional(),
  consentGiven: z.literal(true, { error: "Votre accord est nécessaire pour être contacté." }),
  honeypot: z.string().max(0).optional(),
});

export const supportRequestSchema = z.object({
  subject: z.enum(["SUIVI_COMMANDE", "FACTURE_DEVIS", "PRODUIT_DEFECTUEUX", "FICHE_TECHNIQUE", "AUTRE"]),
  orderReference: z.string().trim().max(20).optional(),
  email,
  message: required("Le message").pipe(z.string().min(10, "Détaillez votre demande (10 caractères minimum).")),
  honeypot: z.string().max(0).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

export const dealerSearchSchema = z.object({
  query: z.string().trim().min(2, "Saisissez une ville ou un code postal."),
  productId: z.coerce.number().int().positive().optional(),
});

export const cookieConsentSchema = z.object({
  analytics: z.coerce.boolean().default(false),
  personalisation: z.coerce.boolean().default(false),
});

/** Filtres de la page catégorie — reflétés dans l’URL. */
export const catalogFilterSchema = z.object({
  materiau: z.union([z.string(), z.array(z.string())]).optional(),
  contenance: z.union([z.string(), z.array(z.string())]).optional(),
  prixMax: z.coerce.number().min(5).max(60).optional(),
  tri: z.enum(["pertinence", "prix-croissant", "prix-decroissant"]).default("pertinence"),
  page: z.coerce.number().int().min(1).default(1),
});

/** Produit — back-office */
export const productSchema = z.object({
  sku: z.string().trim().regex(/^[A-Z0-9-]{4,40}$/, "SKU : majuscules, chiffres et tirets."),
  slug: z.string().trim().regex(/^[a-z0-9-]{3,120}$/, "Slug : minuscules, chiffres et tirets."),
  categoryId: z.coerce.number().int().positive(),
  name: required("Le nom"),
  lotLabel: z.string().trim().max(160).optional(),
  specLine: z.string().trim().max(200).optional(),
  descriptionHtml: z.string().max(20000).optional(),
  bullets: z.array(z.string().trim().min(1)).max(10).optional(),
  /** saisi en euros au back-office, converti en centimes avant écriture */
  basePriceHt: z.coerce.number().min(0.01, "Prix obligatoire."),
  material: z.enum(["FIBRE_MOULEE", "CARTON_CERTIFIE", "KRAFT_BRUT", "PET_RECYCLE", "INOX", "AUTRE"]).optional(),
  capacityMl: z.coerce.number().int().positive().optional(),
  agecStatus: z.enum(["CONFORME", "A_SURVEILLER", "A_REMPLACER"]).default("CONFORME"),
  agecDeadline: z.coerce.date().optional(),
  replacementProductId: z.coerce.number().int().positive().optional(),
  sampleAvailable: z.coerce.boolean().default(false),
  lifetimeWarranty: z.coerce.boolean().default(false),
  stockStatus: z.enum(["EN_STOCK", "SUR_COMMANDE", "EPUISE", "ARRETE"]).default("EN_STOCK"),
  published: z.coerce.boolean().default(true),
  tiers: z
    .array(z.object({ minQty: z.coerce.number().int().min(1), maxQty: z.coerce.number().int().nullable(), unitPriceHt: z.coerce.number().min(0.01) }))
    .optional()
    .refine((t) => !t || t.every((x) => x.maxQty === null || x.maxQty >= x.minQty), "Palier incohérent : quantité max inférieure à la min."),
});

export type FieldErrors = Record<string, string[]>;

/** Aplatit une erreur zod pour l’affichage inline sous chaque champ. */
export function fieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    (out[key] ||= []).push(issue.message);
  }
  return out;
}
