/**
 * Blocs de contenu (Article.bodyBlocks, Page.bodyBlocks).
 * Stockés en JSON MySQL, édités au back-office, rendus par <Blocks />.
 * L’encadré vert (greenCallout) est le bloc réutilisable de la charte.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "greenCallout"; title: string; text: string; ctaLabel?: string; ctaHref?: string }
  | { type: "disclaimer"; text: string }
  | { type: "image"; url: string; alt: string; caption?: string };

export const BLOCK_LABELS: Record<Block["type"], string> = {
  p: "Paragraphe",
  h2: "Titre de section (H2)",
  h3: "Sous-titre (H3)",
  list: "Liste à puces",
  greenCallout: "Encadré vert",
  disclaimer: "Avertissement",
  image: "Image",
};

/** Texte brut d’un corps d’article — sert au temps de lecture et au SEO. */
export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "list": return b.items.join(" ");
        case "greenCallout": return b.title + " " + b.text;
        case "image": return b.caption ?? "";
        default: return b.text;
      }
    })
    .join(" ");
}

export function parseBlocks(value: unknown): Block[] {
  return Array.isArray(value) ? (value as Block[]) : [];
}
