import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, articles, pages] = await Promise.all([
    db.category.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, category: { select: { slug: true } } } }),
    db.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: base, priority: 1 },
    { url: base + "/nos-revendeurs", priority: 0.8 },
    { url: base + "/blog", priority: 0.8 },
    { url: base + "/contact", priority: 0.8 },
    ...categories.map((c) => ({ url: `${base}/boutique/${c.slug}`, lastModified: c.updatedAt, priority: 0.9 })),
    ...products.map((p) => ({ url: `${base}/boutique/${p.category.slug}/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
    ...articles.map((a) => ({ url: `${base}/blog/${a.slug}`, lastModified: a.updatedAt, priority: 0.6 })),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: 0.3 })),
  ];
}
