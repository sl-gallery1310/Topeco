import { db } from "./db";
import { unstable_cache } from "next/cache";

/** Réglages éditables au back-office, mis en cache 5 min. */
export const getSettings = unstable_cache(
  async () => {
    const rows = await db.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
  },
  ["settings"],
  { revalidate: 300, tags: ["settings"] },
);

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
