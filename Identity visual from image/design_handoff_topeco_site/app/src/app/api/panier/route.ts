import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { resolvePrice } from "@/lib/pricing";

const CART_COOKIE = "topeco_cart";

/**
 * Ajout au panier. Le prix est TOUJOURS recalculé ici (palier + remise contractuelle) :
 * la valeur envoyée par le navigateur n’est jamais utilisée.
 */
export async function POST(req: Request) {
  const { productId, qty } = await req.json();
  const quantity = Math.max(1, Math.floor(Number(qty) || 1));

  const product = await db.product.findFirst({
    where: { id: Number(productId), published: true },
    include: { priceTiers: true },
  });
  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  const user = await currentUser();
  const discountPct = Number(user?.account?.contractDiscountPct ?? 0);

  const jar = await cookies();
  let id = jar.get(CART_COOKIE)?.value;
  if (!id) {
    id = randomUUID();
    jar.set(CART_COOKIE, id, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  }
  await db.cart.upsert({ where: { id }, update: { accountId: user?.accountId ?? null }, create: { id, accountId: user?.accountId ?? null } });

  const price = resolvePrice({
    basePriceHt: product.basePriceHt,
    tiers: product.priceTiers,
    qty: quantity,
    vatRate: Number(product.vatRate),
    discountPct,
  });

  await db.cartLine.upsert({
    where: { cartId_productId: { cartId: id, productId: product.id } },
    update: { qty: { increment: quantity }, resolvedUnitPriceHt: price.unitPriceHt },
    create: { cartId: id, productId: product.id, qty: quantity, resolvedUnitPriceHt: price.unitPriceHt },
  });

  const lines = await db.cartLine.findMany({ where: { cartId: id } });
  const subtotalHt = lines.reduce((s, l) => s + l.resolvedUnitPriceHt * l.qty, 0);

  return NextResponse.json({
    ok: true,
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotalHt,
    subtotalTtc: Math.round(subtotalHt * 1.2),
  });
}

export async function GET() {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  if (!id) return NextResponse.json({ lines: [], subtotalHt: 0 });
  const lines = await db.cartLine.findMany({ where: { cartId: id }, include: { product: { select: { name: true, sku: true, slug: true } } } });
  const subtotalHt = lines.reduce((s, l) => s + l.resolvedUnitPriceHt * l.qty, 0);
  return NextResponse.json({ lines, subtotalHt, subtotalTtc: Math.round(subtotalHt * 1.2) });
}
