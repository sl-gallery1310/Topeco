/**
 * Règles de prix TOPECO — appliquées **côté serveur** uniquement.
 *
 * 1. Le palier dégressif est résolu selon la quantité (PriceTier).
 * 2. La remise contractuelle du compte connecté s’applique ensuite (Account.contractDiscountPct).
 * 3. Le TTC est dérivé du HT (TVA 20 % par défaut, portée par le produit).
 *
 * Aucun prix n’est calculé dans le navigateur : le client ne peut pas voir
 * ni deviner le tarif d’un autre compte.
 */

export type Tier = { minQty: number; maxQty: number | null; unitPriceHt: number };

export type ResolvedPrice = {
  unitPriceHt: number;
  unitPriceTtc: number;
  totalHt: number;
  totalTtc: number;
  /** prix catalogue avant remise, pour afficher un prix barré si besoin */
  listUnitPriceHt: number;
  discountPct: number;
  tier: Tier | null;
  qty: number;
};

export function resolveTier(tiers: Tier[], qty: number): Tier | null {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  for (const t of sorted) {
    if (qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty)) return t;
  }
  return sorted.length ? sorted[sorted.length - 1] : null;
}

export function ttc(cents: number, vatRate = 0.2): number {
  return Math.round(cents * (1 + vatRate));
}

export function resolvePrice(opts: {
  basePriceHt: number;
  tiers?: Tier[];
  qty?: number;
  vatRate?: number;
  /** 12 = 12 % */
  discountPct?: number;
}): ResolvedPrice {
  const qty = Math.max(1, Math.floor(opts.qty ?? 1));
  const vatRate = opts.vatRate ?? 0.2;
  const discountPct = opts.discountPct ?? 0;
  const tier = opts.tiers?.length ? resolveTier(opts.tiers, qty) : null;
  const listUnitPriceHt = tier ? tier.unitPriceHt : opts.basePriceHt;
  const unitPriceHt = Math.round(listUnitPriceHt * (1 - discountPct / 100));
  const totalHt = unitPriceHt * qty;
  return {
    unitPriceHt,
    unitPriceTtc: ttc(unitPriceHt, vatRate),
    totalHt,
    totalTtc: ttc(totalHt, vatRate),
    listUnitPriceHt,
    discountPct,
    tier,
    qty,
  };
}

/** « dès 4,90 € HT » sur la carte catégorie : plus bas prix unitaire publié. */
export function priceFrom(products: { basePriceHt: number; priceTiers?: Tier[] }[]): number | null {
  const values = products.map((p) =>
    p.priceTiers?.length ? Math.min(...p.priceTiers.map((t) => t.unitPriceHt)) : p.basePriceHt,
  );
  return values.length ? Math.min(...values) : null;
}
