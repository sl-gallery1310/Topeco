import "server-only";
import { z } from "zod";

/**
 * Variables d'environnement serveur, validées au démarrage : une erreur lisible
 * vaut mieux qu'un plantage Prisma ou un cookie signé avec une clé vide.
 * Ne jamais importer depuis un composant client.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  SESSION_SECRET: z.string().min(16, "SESSION_SECRET doit faire au moins 16 caractères"),
  SESSION_COOKIE_NAME: z.string().default("topeco_session"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")} : ${i.message}`)
    .join("\n");
  throw new Error(
    `Variables d'environnement invalides :\n${details}\n\nCopier .env.example vers .env et le renseigner.`,
  );
}

export const env = parsed.data;
