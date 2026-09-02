/** Constantes partagées client/serveur (pas de secret ici). */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/** Mention à conserver tant que le projet est fictif. */
export const DEMO_FORM_NOTICE = DEMO_MODE ? "Démonstration : aucune donnée n’est réellement transmise." : "";

export const VAT_RATE = 0.2;
