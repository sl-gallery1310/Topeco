import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Sonde de disponibilité + connectivité MySQL : GET /api/health */
export async function GET() {
  const startedAt = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "up",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "down",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
