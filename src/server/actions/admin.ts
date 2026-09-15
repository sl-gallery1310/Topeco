"use server";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { titreTropLong } from "@/lib/blocks";
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
  // Next 16 : le second argument est obligatoire. { expire: 0 } reproduit
  // l'ancien appel à un argument — purge immédiate, pas de contenu périmé servi.
  revalidateTag("settings", { expire: 0 });
  revalidatePath("/admin/reglages");
}

/* --------------------------------------------------------------------- PAGES */

/**
 * Pages de contenu libre (mentions légales, CGV, engagements…).
 * Même motif que saveArticle : le corps est un tableau de blocs JSON.
 */
export async function savePage(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = fd.get("id") ? Number(fd.get("id")) : null;

  const slug = String(fd.get("slug") || "").trim().toLowerCase();
  const title = String(fd.get("title") || "").trim();

  const errors: FieldErrors = {};
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = ["Adresse invalide : minuscules, chiffres et tirets uniquement."];
  }
  if (title.length < 2) errors.title = ["Le titre est obligatoire."];

  let bodyBlocks: unknown = [];
  try {
    bodyBlocks = JSON.parse(String(fd.get("bodyBlocks") || "[]"));
    if (!Array.isArray(bodyBlocks)) throw new Error("pas un tableau");
  } catch {
    errors.bodyBlocks = ["Le corps doit être un tableau JSON de blocs."];
  }
  const titreLong = Array.isArray(bodyBlocks) && titreTropLong(bodyBlocks);
  if (titreLong) errors.bodyBlocks = [titreLong];

  // Le slug est unique : on le vérifie avant d'écrire pour rendre une erreur de champ
  // plutôt qu'une erreur de base.
  const clash = await db.page.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== id) errors.slug = ["Une page utilise déjà cette adresse."];

  if (Object.keys(errors).length) return { ok: false, errors };

  const data = {
    slug,
    title,
    introHtml: String(fd.get("introHtml") || "") || null,
    bodyBlocks: bodyBlocks as never,
    published: fd.get("published") === "on",
    seoTitle: String(fd.get("seoTitle") || "") || null,
    seoDescription: String(fd.get("seoDescription") || "") || null,
  };

  const row = id
    ? await db.page.update({ where: { id }, data })
    : await db.page.create({ data });

  await trace(id ? "update" : "create", "Page", row.id, { slug: row.slug });
  revalidatePath("/" + row.slug);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function togglePagePublished(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const page = await db.page.findUnique({ where: { id }, select: { published: true, slug: true } });
  if (!page) return;
  await db.page.update({ where: { id }, data: { published: !page.published } });
  await trace("update", "Page", id, { published: !page.published });
  revalidatePath("/" + page.slug);
  revalidatePath("/admin/pages");
}

/* ------------------------------------------------------------------ ARTICLES */

/**
 * Articles de blog. Même motif que savePage : validation, erreurs par champ,
 * corps en blocs JSON.
 */
export async function saveArticle(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = fd.get("id") ? Number(fd.get("id")) : null;

  const slug = String(fd.get("slug") || "").trim().toLowerCase();
  const title = String(fd.get("title") || "").trim();
  const dek = String(fd.get("dek") || "").trim();
  const categoryId = Number(fd.get("categoryId"));

  const errors: FieldErrors = {};
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = ["Adresse invalide : minuscules, chiffres et tirets uniquement."];
  }
  if (title.length < 2) errors.title = ["Le titre est obligatoire."];
  if (dek.length < 2) errors.dek = ["Le chapô est obligatoire : il s'affiche dans la liste du blog."];
  if (!Number.isInteger(categoryId) || categoryId <= 0) errors.categoryId = ["Choisissez une rubrique."];

  let bodyBlocks: unknown = [];
  try {
    bodyBlocks = JSON.parse(String(fd.get("bodyBlocks") || "[]"));
    if (!Array.isArray(bodyBlocks)) throw new Error("pas un tableau");
  } catch {
    errors.bodyBlocks = ["Le corps doit être un tableau JSON de blocs."];
  }
  const titreLong = Array.isArray(bodyBlocks) && titreTropLong(bodyBlocks);
  if (titreLong) errors.bodyBlocks = [titreLong];

  const clash = await db.article.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== id) errors.slug = ["Un article utilise déjà cette adresse."];

  if (Object.keys(errors).length) return { ok: false, errors };

  const publie = fd.get("published") === "on";
  // La date de publication est posée à la première mise en ligne et conservée
  // ensuite : la réécrire à chaque enregistrement ferait remonter l'article.
  const existant = id
    ? await db.article.findUnique({ where: { id }, select: { publishedAt: true } })
    : null;

  const data = {
    slug,
    title,
    dek,
    eyebrow: String(fd.get("eyebrow") || "") || null,
    categoryId,
    featured: fd.get("featured") === "on",
    published: publie,
    publishedAt: publie ? (existant?.publishedAt ?? new Date()) : null,
    heroImageUrl: String(fd.get("heroImageUrl") || "") || null,
    heroImageAlt: String(fd.get("heroImageAlt") || "") || null,
    disclaimerText: String(fd.get("disclaimerText") || "") || null,
    seoTitle: String(fd.get("seoTitle") || "") || null,
    seoDescription: String(fd.get("seoDescription") || "") || null,
    bodyBlocks: bodyBlocks as never,
  };

  const row = id
    ? await db.article.update({ where: { id }, data })
    : await db.article.create({ data });

  await trace(id ? "update" : "create", "Article", row.id, { slug: row.slug });
  revalidatePath("/blog");
  revalidatePath("/blog/" + row.slug);
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function toggleArticlePublished(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const article = await db.article.findUnique({
    where: { id },
    select: { published: true, publishedAt: true, slug: true },
  });
  if (!article) return;

  const publie = !article.published;
  await db.article.update({
    where: { id },
    data: { published: publie, publishedAt: publie ? (article.publishedAt ?? new Date()) : null },
  });
  await trace("update", "Article", id, { published: publie });
  revalidatePath("/blog");
  revalidatePath("/blog/" + article.slug);
  revalidatePath("/admin/articles");
}
