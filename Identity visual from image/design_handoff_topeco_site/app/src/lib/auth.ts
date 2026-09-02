/**
 * Sessions maison : cookie httpOnly + table Session.
 * Pas de dépendance externe, suffisant pour un espace client et un back-office.
 * (Remplaçable par Auth.js sans toucher aux appels ci-dessous.)
 */
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { UserRole } from "@prisma/client";

const COOKIE = process.env.SESSION_COOKIE_NAME || "topeco_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 jours

export async function login(email: string, password: string, meta?: { ip?: string; ua?: string }) {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !user.active) return { ok: false as const, error: "Identifiants incorrects." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false as const, error: "Identifiants incorrects." };

  const id = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      id,
      userId: user.id,
      expiresAt: new Date(Date.now() + MAX_AGE * 1000),
      ip: meta?.ip ?? null,
      userAgent: meta?.ua ?? null,
    },
  });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await db.auditLog.create({ data: { userId: user.id, action: "login", entity: "User", entityId: String(user.id) } });

  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return { ok: true as const, role: user.role };
}

export async function logout() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) await db.session.deleteMany({ where: { id } });
  jar.delete(COOKIE);
}

export async function currentUser() {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;
  const session = await db.session.findUnique({
    where: { id },
    include: { user: { include: { account: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

/** Espace client : /mon-compte */
export async function requireClient() {
  const user = await currentUser();
  if (!user) redirect("/connexion?next=/mon-compte");
  if (!user.accountId || !user.account) redirect("/connexion?erreur=compte-non-rattache");
  return { user, account: user.account };
}

/** Back-office : /admin */
export async function requireAdmin(roles: UserRole[] = ["ADMIN", "EDITOR"]) {
  const user = await currentUser();
  if (!user) redirect("/admin/connexion");
  if (!roles.includes(user.role)) redirect("/admin/connexion?erreur=droits");
  return user;
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
