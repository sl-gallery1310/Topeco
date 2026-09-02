import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dealerSearchSchema } from "@/lib/validation";

/**
 * Recherche de revendeurs par ville ou code postal.
 * Sans service de géocodage : correspondance sur le code postal (préfixe département)
 * ou sur la ville. Pour une vraie distance, brancher un géocodeur (adresse.data.gouv.fr)
 * et calculer la distance haversine depuis lat/lng.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = dealerSearchSchema.safeParse({
    query: url.searchParams.get("q") ?? "",
    productId: url.searchParams.get("produit") ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide", results: [] }, { status: 400 });

  const { query, productId } = parsed.data;
  const isPostcode = /^\d{2,5}$/.test(query);
  const dept = isPostcode ? query.slice(0, 2) : null;

  const results = await db.reseller.findMany({
    where: {
      published: true,
      ...(productId ? { stocks: { some: { productId } } } : {}),
      OR: [
        ...(dept ? [{ postcode: { startsWith: dept } }] : []),
        { city: { contains: query } },
        { regionLabel: { contains: query } },
      ],
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    take: 10,
    select: { id: true, companyName: true, regionLabel: true, city: true, postcode: true, phone: true, pickupPointCount: true, type: true, status: true },
  });

  // Mesure des zones non couvertes : utile au back-office (« Recherches sans résultat »)
  await db.dealerSearch.create({ data: { query, productId: productId ?? null, results: results.length } });

  return NextResponse.json({ results });
}
