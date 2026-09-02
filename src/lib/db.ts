import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

/**
 * Client Prisma unique (singleton) : chaque instance ouvre son propre pool,
 * et le rechargement à chaud du mode dev en créerait un par sauvegarde.
 * Prisma 7 passe par un adaptateur de driver — ici MariaDB, qui parle à MySQL 8.
 */
const createClient = () =>
  new PrismaClient({
    adapter: new PrismaMariaDb(env.DATABASE_URL),
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const db = globalForPrisma.prisma ?? createClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
