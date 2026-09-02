import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";

/**
 * Téléchargement de facture authentifié : le fichier n’est jamais servi directement
 * depuis /public — on vérifie que la commande appartient bien au compte connecté.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const { account } = await requireClient();

  const order = await db.order.findFirst({ where: { reference, accountId: account.id } });
  if (!order?.invoiceUrl) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  try {
    const file = await readFile(path.join(process.cwd(), "private", order.invoiceUrl.replace(/^\//, "")));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${reference}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier absent sur le serveur" }, { status: 404 });
  }
}
