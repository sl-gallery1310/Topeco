"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";
import { DEMO_MODE } from "@/lib/constants";

const CART_COOKIE = "topeco_cart";

async function cartId(accountId?: number) {
  const jar = await cookies();
  let id = jar.get(CART_COOKIE)?.value;
  if (!id) {
    id = randomUUID();
    jar.set(CART_COOKIE, id, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  }
  await db.cart.upsert({ where: { id }, update: { accountId }, create: { id, accountId } });
  return id;
}

/** « Repasser ma dernière commande » : reconstruit un panier depuis les lignes de la dernière commande. */
export async function reorderLastOrder() {
  const { account } = await requireClient();
  const last = await db.order.findFirst({
    where: { accountId: account.id },
    orderBy: { placedAt: "desc" },
    include: { lines: { include: { product: { include: { priceTiers: true } } } } },
  });
  if (!last) return;

  const id = await cartId(account.id);
  await db.cartLine.deleteMany({ where: { cartId: id } });

  const discountPct = Number(account.contractDiscountPct);
  for (const line of last.lines) {
    if (!line.product || !line.product.published || line.product.stockStatus === "ARRETE") continue;
    const price = resolvePrice({
      basePriceHt: line.product.basePriceHt,
      tiers: line.product.priceTiers,
      qty: line.qty,
      vatRate: Number(line.product.vatRate),
      discountPct,
    });
    await db.cartLine.create({
      data: { cartId: id, productId: line.product.id, qty: line.qty, resolvedUnitPriceHt: price.unitPriceHt },
    });
  }
  revalidatePath("/mon-compte");
}

/**
 * Acceptation d’un devis : transition d’état réelle (devis → commande).
 * En mode projet étudiant, le devis est marqué accepté mais aucune commande n’est créée.
 */
export async function acceptQuote(fd: FormData) {
  const { account } = await requireClient();
  const quoteId = Number(fd.get("quoteId"));

  const quote = await db.quote.findFirst({
    where: { id: quoteId, accountId: account.id, status: "EN_COURS" },
    include: { lines: true },
  });
  if (!quote) return;
  if (quote.validUntil < new Date()) {
    await db.quote.update({ where: { id: quote.id }, data: { status: "EXPIRE" } });
    revalidatePath("/mon-compte");
    return;
  }

  if (DEMO_MODE) {
    await db.quote.update({ where: { id: quote.id }, data: { status: "ACCEPTE", acceptedAt: new Date() } });
  } else {
    const year = String(new Date().getFullYear()).slice(2);
    const count = await db.order.count();
    const order = await db.order.create({
      data: {
        reference: `CMD-${year}-${String(count + 1).padStart(4, "0")}`,
        accountId: account.id,
        status: "EN_PREPARATION",
        totalHt: quote.totalHt,
        vatAmount: quote.totalTtc - quote.totalHt,
        totalTtc: quote.totalTtc,
        discountPct: account.contractDiscountPct,
        lines: { create: quote.lines.map(({ id, quoteId, ...l }) => l) },
      },
    });
    await db.quote.update({ where: { id: quote.id }, data: { status: "ACCEPTE", acceptedAt: new Date(), orderId: order.id } });
  }
  revalidatePath("/mon-compte");
}
