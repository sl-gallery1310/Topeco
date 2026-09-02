import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { cookieConsentSchema } from "@/lib/validation";
import { currentUser } from "@/lib/auth";

/** Enregistre le choix cookies : cookie (1 an) + trace en base (preuve du consentement). */
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = cookieConsentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const jar = await cookies();
  const id = jar.get("topeco_consent_id")?.value ?? randomUUID();
  const user = await currentUser();

  await db.cookieConsent.upsert({
    where: { id },
    update: { ...parsed.data, decidedAt: new Date(), userId: user?.id ?? null },
    create: {
      id,
      ...parsed.data,
      userId: user?.id ?? null,
      policyVersion: String(body.policyVersion ?? "2026-01"),
      ip: (await headers()).get("x-forwarded-for")?.split(",")[0] ?? null,
    },
  });

  const value = JSON.stringify({ a: parsed.data.analytics, p: parsed.data.personalisation });
  jar.set("topeco_consent", value, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  jar.set("topeco_consent_id", id, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });

  return NextResponse.json({ ok: true });
}
