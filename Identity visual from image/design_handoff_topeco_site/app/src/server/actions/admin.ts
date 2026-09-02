"use server";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

export type AdminState = { ok?: boolean; errors?: FieldErrors };

async function trace(action: string, entity: string, entityId: string | number, payload?: unknown) {
  const user = await requireAdmin();
  await db.auditLog.create({
    data: { userId: user.id, action, entity, entityId: String(entityId), payload: payload as never },
  });
}

/* ------------------------------------------------------------------ PRODUITS */

export async function saveProduct(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = fd.get("id") ? Number(fd.get("id")) : null;

  const tiers: { minQty: number; maxQty: number | null; unitPriceHt: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const min = fd.get(`tier-${i}-minQty`);
    const price = fd.get(`tier-${i}-unitPriceHt`);
    if (!min || !price) continue;
    const max = fd.get(`tier-${i}-maxQty`);
    tiers.push({ minQty: Number(min), maxQty: max ? Number(max) : null, unitPriceHt: Number(price) });
  }

  const parsed = productSchema.safeParse({
    ...Object.fromEntries(fd.entries()),
    bullets: String(fd.get("bullets") ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    sampleAvailable: fd.get("sampleAvailable") === "on",
    lifetimeWarranty: fd.get("lifetimeWarranty") === "on",
    published: fd.get("published") === "on",
    material: fd.get("material") || undefined,
    capacityMl: fd.get("capacityMl") || undefined,
    agecDeadline: fd.get("agecDeadline") || undefined,
    replacementProductId: fd.get("replacementProductId") || undefined,
    tiers,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { basePriceHt, tiers: tierInput, ...rest } = parsed.data;
  const data = { ...rest, basePriceHt: Math.round(basePriceHt * 100) };

  try {
    const product = id
      ? await db.product.update({ where: { id }, data })
      : await db.product.create({ data });

    if (tierInput) {
      await db.priceTier.deleteMany({ where: { productId: product.id } });
      await db.priceTier.createMany({
        data: tierInput.map((t) => ({ productId: product.id, minQty: t.minQty, maxQty: t.maxQty, unitPriceHt: Math.round(t.unitPriceHt * 100) })),
      });
    }

    await trace(id ? "update" : "create", "Product", product.id, data);
    revalidatePath("/boutique/" + (await db.category.findUnique({ where: { id: data.categoryId } }))!.slug);
    revalidatePath("/");
    redirect("/admin/produits?enregistre=" + product.sku);
  } catch (e) {
    const message = e instanceof Error && e.message.includes("Unique") ? "Ce SKU ou ce slug existe déjà." : "Enregistrement impossible.";
    return { errors: { _form: [message] } };
  }
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin(["ADMIN"]);
  const id = Number(fd.get("id"));
  // suppression logique : on dépublie plutôt que d’effacer (les commandes y font référence)
  await db.product.update({ where: { id }, data: { published: false, stockStatus: "ARRETE" } });
  await trace("delete", "Product", id);
  revalidatePath("/admin/produits");
}

/* ------------------------------------------------------------------ DEMANDES */

export async function setApplicationStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = String(fd.get("status")) as "NEW" | "QUALIFYING" | "ACCEPTED" | "REJECTED";
  await db.resellerApplication.update({ where: { id }, data: { status } });
  await trace("status-change", "ResellerApplication", id, { status });
  revalidatePath("/admin/demandes");
}

export async function setAppointmentStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = String(fd.get("status")) as "REQUESTED" | "CONFIRMED" | "DONE" | "CANCELLED";
  await db.appointment.update({ where: { id }, data: { status } });
  await trace("status-change", "Appointment", id, { status });
  revalidatePath("/admin/demandes");
}

export async function setSupportStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = String(fd.get("status")) as "NEW" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
  await db.supportRequest.update({
    where: { id },
    data: { status, answeredAt: status === "ANSWERED" ? new Date() : undefined },
  });
  await trace("status-change", "SupportRequest", id, { status });
  revalidatePath("/admin/demandes");
}

export async function setOrderStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = String(fd.get("status")) as "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "FACTURE_A_REGLER" | "ANNULEE";
  await db.order.update({ where: { id }, data: { status } });
  await trace("status-change", "Order", id, { status });
  revalidatePath("/admin/commandes");
  revalidatePath("/mon-compte");
}

/* ------------------------------------------------------------------ RÉGLAGES */

export async function saveSettings(fd: FormData) {
  await requireAdmin(["ADMIN"]);
  const entries = [...fd.entries()].filter(([k]) => k.startsWith("setting."));
  for (const [key, value] of entries) {
    await db.setting.update({ where: { key: key.replace("setting.", "") }, data: { value: String(value) } });
  }
  await trace("update", "Setting", "batch", { count: entries.length });
  revalidateTag("settings");
  revalidatePath("/admin/reglages");
}

/* ------------------------------------------------------------------ ARTICLES */

export async function saveArticle(fd: FormData) {
  await requireAdmin();
  const id = fd.get("id") ? Number(fd.get("id")) : null;
  let bodyBlocks: unknown;
  try {
    bodyBlocks = JSON.parse(String(fd.get("bodyBlocks") || "[]"));
  } catch {
    return;
  }
  const data = {
    slug: String(fd.get("slug")),
    title: String(fd.get("title")),
    dek: String(fd.get("dek")),
    eyebrow: String(fd.get("eyebrow") || "") || null,
    categoryId: Number(fd.get("categoryId")),
    featured: fd.get("featured") === "on",
    published: fd.get("published") === "on",
    publishedAt: fd.get("published") === "on" ? new Date() : null,
    heroImageUrl: String(fd.get("heroImageUrl") || "") || null,
    heroImageAlt: String(fd.get("heroImageAlt") || "") || null,
    disclaimerText: String(fd.get("disclaimerText") || "") || null,
    bodyBlocks: bodyBlocks as never,
  };
  const row = id ? await db.article.update({ where: { id }, data }) : await db.article.create({ data });
  await trace(id ? "update" : "create", "Article", row.id);
  revalidatePath("/blog");
  revalidatePath("/blog/" + row.slug);
  redirect("/admin/articles");
}
